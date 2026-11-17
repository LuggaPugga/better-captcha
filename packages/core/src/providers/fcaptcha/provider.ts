import { type CaptchaCallbacks, type CaptchaHandle, Provider, type ScriptOptions } from "../../provider";
import type { FCaptchaApi, FCaptchaSession, RenderParameters } from "./types";

declare global {
	interface Window {
		FCaptcha?: FCaptchaApi;
	}
}

export type FCaptchaHandle = CaptchaHandle;

type Instance = {
	session: FCaptchaSession;
	options: RenderParameters;
	callbacks?: CaptchaCallbacks;
	field?: HTMLInputElement;
	token: string;
	generation: number;
	pending?: Promise<void>;
};

/** Native invisible-mode integration. Execution is explicit; it never intercepts other forms. */
export class FCaptchaProvider extends Provider<RenderParameters, FCaptchaHandle> {
	private instances = new Map<string, Instance>();

	constructor(sitekey: string, scriptOptions?: ScriptOptions) {
		super({ scriptUrl: "/fcaptcha.js", scriptOptions }, sitekey);
	}

	async init() {
		await this.loadProviderScript({ async: true, defer: true });
		if (typeof window.FCaptcha?.invisible !== "function") {
			throw new Error("FCaptcha script did not expose the invisible session API");
		}
	}

	private createSession(options: RenderParameters) {
		if (!window.FCaptcha) throw new Error("FCaptcha is not initialized");
		return window.FCaptcha.invisible({
			siteKey: this.identifier,
			serverUrl: options.serverUrl,
			...(options.minCollectionTime === undefined ? {} : { minCollectionTime: options.minCollectionTime }),
			autoScore: false,
		});
	}

	render(element: HTMLElement, options?: RenderParameters, callbacks?: CaptchaCallbacks) {
		if (!options?.serverUrl) throw new Error("FCaptcha requires options.serverUrl");
		const url = new URL(options.serverUrl);
		if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
			throw new Error("FCaptcha serverUrl must be an HTTP(S) base URL without credentials, query or fragment");
		}
		const resolvedOptions = { ...options, serverUrl: url.href.replace(/\/+$/, "") };
		const session = this.createSession(resolvedOptions);
		const id = session.id;
		let field: HTMLInputElement | undefined;
		if (options.responseField !== false) {
			field = document.createElement("input");
			field.type = "hidden";
			field.name = options.responseFieldName ?? "fcaptcha_token";
			element.appendChild(field);
		}
		this.instances.set(id, { session, options: resolvedOptions, callbacks, field, token: "", generation: 0 });
		queueMicrotask(() => {
			if (this.instances.has(id)) callbacks?.onReady?.();
		});
		return id;
	}

	reset(widgetId: string) {
		const instance = this.instances.get(widgetId);
		if (!instance) return;
		instance.generation++;
		instance.pending = undefined;
		instance.token = "";
		if (instance.field) instance.field.value = "";
		instance.session.destroy();
		instance.session = this.createSession(instance.options);
	}

	async execute(widgetId: string) {
		const instance = this.instances.get(widgetId);
		if (!instance) throw new Error("FCaptcha instance is not rendered");
		if (instance.pending) return instance.pending;
		const generation = instance.generation;
		const session = instance.session;
		instance.token = "";
		if (instance.field) instance.field.value = "";
		const current = () => this.instances.get(widgetId) === instance && instance.generation === generation;
		const run = async () => {
			try {
				if (!current()) throw new Error("FCaptcha execution was cancelled");
				const result = await session.execute(instance.options.action, instance.options.cdata);
				if (!current()) throw new Error("FCaptcha execution was cancelled");
				if (result.success !== true || typeof result.token !== "string" || !result.token) {
					throw new Error("FCaptcha verification did not return a successful token");
				}
				instance.token = result.token;
				if (instance.field) instance.field.value = result.token;
				instance.callbacks?.onSolve?.(result.token);
			} catch (error) {
				if (current()) instance.callbacks?.onError?.(error instanceof Error ? error : String(error));
				throw error;
			} finally {
				if (current()) instance.pending = undefined;
			}
		};
		instance.pending = Promise.resolve().then(run);
		return instance.pending;
	}

	destroy(widgetId: string) {
		const instance = this.instances.get(widgetId);
		if (!instance) return;
		this.instances.delete(widgetId);
		instance.session.destroy();
		instance.field?.remove();
	}

	getResponse(widgetId: string): string {
		return this.instances.get(widgetId)?.token ?? "";
	}
}
