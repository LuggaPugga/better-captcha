import { afterEach, describe, expect, it, type MockInstance, vi } from "vitest";
import {
	CaptchaServerError,
	verifyCaptchaFox,
	verifyFriendlyCaptcha,
	verifyHCaptcha,
	verifyPrivateCaptcha,
	verifyProsopo,
	verifyReCaptcha,
	verifyReCaptchaCompatible,
	verifyToken,
	verifyTurnstile,
} from "../src";
import { assertNonEmptyString } from "../src/shared";

const TOKENS = {
	turnstile: "XXXX.DUMMY.TOKEN.XXXX",
	hcaptchaPass: "10000000-aaaa-bbbb-cccc-000000000001",
	friendlyCaptcha: "frc_foobar",
	privateCaptcha:
		"AQIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA.Aaqqqqq7u8zM3d3u7u7u7u4AAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAA=.AQCBnM2czBK6rlq+l06lXBtIDQH/PFk=",
} as const;

const KEYS = {
	turnstileSecret: "1x0000000000000000000000000000000AA",
	recaptchaSitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
	recaptchaSecret: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe",
	hcaptchaSitekey: "10000000-ffff-ffff-ffff-000000000001",
	hcaptchaSecret: "0x0000000000000000000000000000000000000000",
	captchaFoxSitekey: "sk_11111111000000001111111100000000",
	captchaFoxSecret: "ok_11111111000000001111111100000000",
	captchaFoxFailingSitekey: "sk_FFFFFFFF00000000FFFFFFFF00000000",
	captchaFoxFailingSecret: "ok_FFFFFFFF00000000FFFFFFFF00000000",
	privateCaptchaApiKey: "your-api-key",
} as const;

function createJsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
		},
	});
}

type FetchSpy = MockInstance<typeof fetch>;

function mockFetchJson(body: unknown, status = 200): FetchSpy {
	return vi.spyOn(globalThis, "fetch").mockImplementation(async () => createJsonResponse(body, status));
}

function getRequest(fetchSpy: FetchSpy, call = 0): { url: string; init: RequestInit } {
	const request = fetchSpy.mock.calls[call];
	const input = request?.[0] as RequestInfo | URL | undefined;
	const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input?.url ?? "");
	const init = (request?.[1] ?? {}) as RequestInit;
	return { url, init };
}

function getBody(fetchSpy: FetchSpy, call = 0): string {
	return String(getRequest(fetchSpy, call).init.body);
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("turnstile", () => {
	it("validates success and sends provider-specific fields", async () => {
		const fetchSpy = mockFetchJson({
			success: true,
			challenge_ts: "2026-02-26T12:00:00.000Z",
			hostname: "example.com",
			action: "signup",
			cdata: "abc",
		});

		const result = await verifyTurnstile({
			secret: KEYS.turnstileSecret,
			response: TOKENS.turnstile,
			remoteip: "203.0.113.10",
			idempotencyKey: "req-123",
			expectedHostname: "example.com",
			expectedAction: "signup",
		});

		expect(result.success).toBe(true);
		expect(getRequest(fetchSpy).url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");

		const body = getBody(fetchSpy);
		expect(body).toContain(`secret=${encodeURIComponent(KEYS.turnstileSecret)}`);
		expect(body).toContain(`response=${encodeURIComponent(TOKENS.turnstile)}`);
		expect(body).toContain("remoteip=203.0.113.10");
		expect(body).toContain("idempotency_key=req-123");
	});

	it("returns mismatch errors when expected metadata does not match", async () => {
		mockFetchJson({
			success: true,
			hostname: "wrong.example.com",
			action: "other",
		});

		const result = await verifyTurnstile({
			secret: KEYS.turnstileSecret,
			response: TOKENS.turnstile,
			expectedHostname: "example.com",
			expectedAction: "signup",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toEqual(expect.arrayContaining(["hostname-mismatch", "action-mismatch"]));
		}
	});
});

describe("recaptcha", () => {
	it("validates v3-style action and score checks", async () => {
		const fetchSpy = mockFetchJson({
			success: true,
			hostname: "example.com",
			action: "submit",
			score: 0.9,
		});

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			expectedHostname: "example.com",
			expectedAction: "submit",
			minScore: 0.5,
		});

		expect(result.success).toBe(true);
		expect(getRequest(fetchSpy).url).toBe("https://www.google.com/recaptcha/api/siteverify");
	});

	it("returns provider error codes on failed verification", async () => {
		mockFetchJson({
			success: false,
			"error-codes": ["timeout-or-duplicate"],
		});

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toEqual(["timeout-or-duplicate"]);
		}
	});

	it("returns semantic mismatch codes for action and score", async () => {
		mockFetchJson({
			success: true,
			hostname: "example.com",
			action: "login",
			score: 0.2,
		});

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			expectedAction: "signup",
			minScore: 0.8,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toEqual(expect.arrayContaining(["action-mismatch", "score-too-low"]));
		}
	});
});

describe("hcaptcha", () => {
	it("sends sitekey and maps score constraints", async () => {
		const fetchSpy = mockFetchJson({
			success: true,
			score: 0.2,
			hostname: "example.com",
		});

		const result = await verifyHCaptcha({
			secret: KEYS.hcaptchaSecret,
			response: TOKENS.hcaptchaPass,
			sitekey: KEYS.hcaptchaSitekey,
			minScore: 0.5,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toContain("score-too-low");
		}

		expect(getRequest(fetchSpy).url).toBe("https://api.hcaptcha.com/siteverify");
		const body = getBody(fetchSpy);
		expect(body).toContain(`response=${encodeURIComponent(TOKENS.hcaptchaPass)}`);
		expect(body).toContain(`secret=${encodeURIComponent(KEYS.hcaptchaSecret)}`);
		expect(body).toContain(`sitekey=${encodeURIComponent(KEYS.hcaptchaSitekey)}`);
	});
});

describe("friendly-captcha", () => {
	it("returns success when provider returns success", async () => {
		mockFetchJson({
			success: true,
		});

		const result = await verifyFriendlyCaptcha({
			apiKey: "FCAT_myapikey",
			response: TOKENS.friendlyCaptcha,
		});

		expect(result.success).toBe(true);
	});

	it("sends x-api-key and maps error codes", async () => {
		const fetchSpy = mockFetchJson({
			success: false,
			error: {
				error_code: "response_invalid",
			},
		});

		const result = await verifyFriendlyCaptcha({
			apiKey: "FCAT_myapikey",
			response: TOKENS.friendlyCaptcha,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toEqual(["response_invalid"]);
		}

		expect(getRequest(fetchSpy).url).toBe("https://global.frcapi.com/api/v2/captcha/siteverify");
		const headers = getRequest(fetchSpy).init.headers as Record<string, string>;
		expect(headers["x-api-key"]).toBe("FCAT_myapikey");
	});
});

describe("recaptcha-compatible wrappers", () => {
	it("verifies token with base recaptcha-compatible provider", async () => {
		const fetchSpy = mockFetchJson({ success: true, hostname: "example.com" });

		const result = await verifyReCaptchaCompatible({
			endpoint: "https://example.com/siteverify",
			secret: KEYS.recaptchaSecret,
			response: TOKENS.privateCaptcha,
		});

		expect(result.success).toBe(true);
		expect(getRequest(fetchSpy).url).toBe("https://example.com/siteverify");
	});

	it("supports captcha-fox, private-captcha, and prosopo", async () => {
		const fetchSpy = mockFetchJson({ success: true, hostname: "example.com" });
		const baseOptions = {
			endpoint: "https://example.com/siteverify",
			response: TOKENS.privateCaptcha,
		};

		const fox = await verifyCaptchaFox({ ...baseOptions, secret: KEYS.captchaFoxSecret });
		const privateCaptcha = await verifyPrivateCaptcha({ ...baseOptions, secret: KEYS.privateCaptchaApiKey });
		const prosopo = await verifyProsopo({ ...baseOptions, secret: KEYS.recaptchaSecret });

		expect(fox.success).toBe(true);
		expect(privateCaptcha.success).toBe(true);
		expect(prosopo.success).toBe(true);
		expect(fetchSpy).toHaveBeenCalledTimes(3);
	});
});

describe("private-captcha", () => {
	it("treats property-test responses as successful verification", async () => {
		const fetchSpy = mockFetchJson({
			success: true,
			code: 10,
			"error-codes": ["property-test"],
			timestamp: "0001-01-01T00:00:00Z",
			origin: "",
		});

		const result = await verifyPrivateCaptcha({
			endpoint: "https://api.privatecaptcha.com/verify",
			secret: KEYS.privateCaptchaApiKey,
			response: TOKENS.privateCaptcha,
		});

		expect(result.success).toBe(true);
		expect(getRequest(fetchSpy).url).toBe("https://api.privatecaptcha.com/verify");
		const body = getBody(fetchSpy);
		expect(body).toContain(`secret=${encodeURIComponent(KEYS.privateCaptchaApiKey)}`);
		expect(body).toContain(`response=${encodeURIComponent(TOKENS.privateCaptcha)}`);
	});
});

describe("verifyToken", () => {
	it("dispatches captcha-fox", async () => {
		mockFetchJson({ success: true, hostname: "example.com" });

		const result = await verifyToken("captcha-fox", {
			endpoint: "https://example.com/siteverify",
			secret: KEYS.captchaFoxSecret,
			response: TOKENS.privateCaptcha,
		});

		expect(result.success).toBe(true);
	});

	it("dispatches recaptcha-v3 alias", async () => {
		mockFetchJson({
			success: true,
			hostname: "example.com",
			action: "submit",
			score: 0.9,
		});

		const result = await verifyToken("recaptcha-v3", {
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			expectedAction: "submit",
			minScore: 0.5,
		});

		expect(result.success).toBe(true);
	});
});

describe("result callbacks", () => {
	it("calls onSuccess when verification succeeds", async () => {
		mockFetchJson({
			success: true,
			hostname: "example.com",
			action: "submit",
			score: 0.9,
		});
		const onSuccess = vi.fn();
		const onError = vi.fn();

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			onSuccess,
			onError,
		});

		expect(result.success).toBe(true);
		expect(onSuccess).toHaveBeenCalledTimes(1);
		expect(onSuccess).toHaveBeenCalledWith(result);
		expect(onError).not.toHaveBeenCalled();
	});

	it("calls onError when verification fails", async () => {
		mockFetchJson({
			success: false,
			"error-codes": ["timeout-or-duplicate"],
		});
		const onSuccess = vi.fn();
		const onError = vi.fn();

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			onSuccess,
			onError,
		});

		expect(result.success).toBe(false);
		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith(result);
		expect(onSuccess).not.toHaveBeenCalled();
	});
});

describe("error handling", () => {
	it("throws CaptchaServerError for non-object JSON responses", async () => {
		mockFetchJson([]);

		await expect(
			verifyTurnstile({
				secret: KEYS.turnstileSecret,
				response: TOKENS.turnstile,
			}),
		).rejects.toMatchObject({ code: "invalid-response" });
	});

	it("throws CaptchaServerError when runtime fetch is unavailable", async () => {
		const originalFetch = globalThis.fetch;
		(globalThis as { fetch?: typeof fetch }).fetch = undefined;

		try {
			await expect(
				verifyTurnstile({
					secret: KEYS.turnstileSecret,
					response: TOKENS.turnstile,
				}),
			).rejects.toMatchObject({ code: "invalid-runtime" });
		} finally {
			(globalThis as { fetch?: typeof fetch }).fetch = originalFetch;
		}
	});

	it("throws CaptchaServerError when request times out", async () => {
		const hangingFetcher = (async (_input, init) => {
			const signal = init?.signal;
			await new Promise<never>((_, reject) => {
				if (!signal) {
					return;
				}
				if (signal.aborted) {
					reject(signal.reason ?? new Error("aborted"));
					return;
				}
				signal.addEventListener("abort", () => reject(signal.reason ?? new Error("aborted")), { once: true });
			});
		}) as unknown as typeof fetch;

		await expect(
			verifyTurnstile({
				secret: KEYS.turnstileSecret,
				response: TOKENS.turnstile,
				timeoutMs: 5,
				fetcher: hangingFetcher,
			}),
		).rejects.toMatchObject({ code: "network-error" });
	});

	it("throws CaptchaServerError for non-2xx responses", async () => {
		mockFetchJson({ message: "bad request" }, 400);

		await expect(
			verifyTurnstile({
				secret: KEYS.turnstileSecret,
				response: TOKENS.turnstile,
			}),
		).rejects.toBeInstanceOf(CaptchaServerError);
	});
});

describe("shared utilities", () => {
	it("throws on empty string values", () => {
		expect(() => assertNonEmptyString("", "secret", "turnstile")).toThrow(CaptchaServerError);
	});

	it("throws on non-string values", () => {
		expect(() => assertNonEmptyString(123, "secret", "turnstile")).toThrow(CaptchaServerError);
	});
});
