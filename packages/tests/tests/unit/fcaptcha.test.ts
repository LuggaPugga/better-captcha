import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { FCaptchaProvider } from "../../../core/src/providers/fcaptcha/provider";
import type { FCaptchaApi, FCaptchaResult } from "../../../core/src/providers/fcaptcha/types";

const options = { serverUrl: "https://captcha.example.test/base/", action: "contact", cdata: "request-1" };
let calls: Array<{ options: unknown; execute: ReturnType<typeof mock>; destroy: ReturnType<typeof mock> }>;
let provider: FCaptchaProvider;
let children: Array<{ type: string; name: string; value: string; remove: () => void }>;
let host: HTMLElement;
const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

beforeEach(() => {
	calls = [];
	children = [];
	const api: FCaptchaApi = {
		invisible(config) {
			const call = {
				options: config,
				execute: mock(async (): Promise<FCaptchaResult> => ({ success: true, token: "fixture-token" })),
				destroy: mock(() => {}),
			};
			calls.push(call);
			return { id: `session-${calls.length}`, execute: call.execute, destroy: call.destroy };
		},
	};
	Object.defineProperty(globalThis, "window", { configurable: true, value: { FCaptcha: api } });
	Object.defineProperty(globalThis, "document", {
		configurable: true,
		value: {
			createElement: () => {
				const field = {
					type: "",
					name: "",
					value: "",
					remove: () => {
						children = children.filter((child) => child !== field);
					},
				};
				return field;
			},
		},
	});
	host = { appendChild: (field: (typeof children)[number]) => children.push(field) } as unknown as HTMLElement;
	provider = new FCaptchaProvider("public-site-key", { autoLoad: false });
});

afterEach(() => {
	if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
	else Reflect.deleteProperty(globalThis, "window");
	if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument);
	else Reflect.deleteProperty(globalThis, "document");
});

describe("FCaptcha invisible provider", () => {
	test("validates the loaded API", async () => {
		await provider.init();
		delete window.FCaptcha;
		await expect(provider.init()).rejects.toThrow("invisible session API");
	});
	test("creates an explicit session and does not intercept forms", async () => {
		const ready = mock(() => {});
		provider.render(host, options, { onReady: ready });
		await Promise.resolve();
		expect(calls[0]?.options).toEqual({
			siteKey: "public-site-key",
			serverUrl: "https://captcha.example.test/base",
			autoScore: false,
		});
		expect(ready).toHaveBeenCalledTimes(1);
		expect(calls[0]?.execute).not.toHaveBeenCalled();
	});
	test("emits a successful token and forwards action/cdata", async () => {
		const solved = mock(() => {});
		const id = provider.render(host, options, { onSolve: solved });
		await provider.execute(id);
		expect(calls[0]?.execute).toHaveBeenCalledWith("contact", "request-1");
		expect(provider.getResponse(id)).toBe("fixture-token");
		expect(children[0]?.value).toBe("fixture-token");
		expect(solved).toHaveBeenCalledWith("fixture-token");
	});
	test.each([{ success: false, token: "must-not-accept" }, { success: true }, { success: true, token: "" }])(
		"rejects failed or malformed results %j",
		async (result) => {
			const solved = mock(() => {});
			const error = mock(() => {});
			const id = provider.render(host, options, { onSolve: solved, onError: error });
			calls[0]?.execute.mockResolvedValueOnce(result);
			await expect(provider.execute(id)).rejects.toThrow("successful token");
			expect(provider.getResponse(id)).toBe("");
			expect(children[0]?.value).toBe("");
			expect(solved).not.toHaveBeenCalled();
			expect(error).toHaveBeenCalledTimes(1);
		},
	);
	test("clears an old token when the next request fails and allows retry", async () => {
		const id = provider.render(host, options);
		await provider.execute(id);
		calls[0]?.execute.mockRejectedValueOnce(new Error("offline"));
		await expect(provider.execute(id)).rejects.toThrow("offline");
		expect(provider.getResponse(id)).toBe("");
		expect(children[0]?.value).toBe("");
		await provider.execute(id);
		expect(provider.getResponse(id)).toBe("fixture-token");
	});
	test("deduplicates concurrent execution", async () => {
		const id = provider.render(host, options);
		await Promise.all([provider.execute(id), provider.execute(id)]);
		expect(calls[0]?.execute).toHaveBeenCalledTimes(1);
	});
	test.each(["reset", "destroy"] as const)("suppresses a late solve after %s", async (operation) => {
		let resolve!: (result: FCaptchaResult) => void;
		const solved = mock(() => {});
		const id = provider.render(host, options, { onSolve: solved });
		calls[0]?.execute.mockImplementationOnce(
			() =>
				new Promise<FCaptchaResult>((r) => {
					resolve = r;
				}),
		);
		const pending = provider.execute(id);
		await Promise.resolve();
		provider[operation](id);
		resolve({ success: true, token: "stale" });
		await expect(pending).rejects.toThrow("cancelled");
		expect(solved).not.toHaveBeenCalled();
		expect(provider.getResponse(id)).toBe("");
		expect(calls[0]?.destroy).toHaveBeenCalledTimes(1);
	});
	test("reset creates a fresh session; destroy removes only its own field", async () => {
		const id = provider.render(host, options);
		provider.reset(id);
		expect(calls).toHaveLength(2);
		await provider.execute(id);
		provider.destroy(id);
		provider.destroy(id);
		expect(calls[1]?.destroy).toHaveBeenCalledTimes(1);
		expect(children).toHaveLength(0);
		await expect(provider.execute(id)).rejects.toThrow("not rendered");
	});
	test("supports independent endpoints and optional response fields", () => {
		provider.render(host, { ...options, responseField: false });
		provider.render(host, { serverUrl: "https://second.example.test", responseFieldName: "custom_token" });
		expect(children).toHaveLength(1);
		expect(children[0]?.name).toBe("custom_token");
		expect(calls[1]?.options).toMatchObject({ serverUrl: "https://second.example.test" });
	});
	test("requires an explicit safe server URL", () => {
		expect(() => provider.render(host)).toThrow("options.serverUrl");
		for (const serverUrl of [
			"javascript:alert(1)",
			"https://user:secret@example.test",
			"https://example.test/?secret=x",
		]) {
			expect(() => provider.render(host, { serverUrl })).toThrow("HTTP(S)");
		}
		expect(calls).toHaveLength(0);
	});
});
