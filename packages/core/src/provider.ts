import { type LoadScriptOptions, loadScript } from "./utils/load-script";

export interface ScriptOptions {
	/** When false, skip automatic script loading. Defaults to true. */
	autoLoad?: boolean;
	/** Script loading timeout in milliseconds. Defaults to 15000. */
	timeout?: number;
	/** Custom script URL. */
	overrideScriptUrl?: string;
	nonce?: string;
	integrity?: string;
	crossOrigin?: "" | "anonymous" | "use-credentials" | null;
	referrerPolicy?: HTMLScriptElement["referrerPolicy"];
	fetchPriority?: "high" | "low" | "auto";
	scriptAttributes?: Record<string, string>;
}

export interface ProviderConfig {
	scriptUrl: string;
	scriptOptions?: ScriptOptions;
}

export type WidgetId = string | number;

/** Common widget controls, extended by provider-specific handles. */
export interface CaptchaHandle<TResponse = string> {
	/** Reset the widget and clear its response. */
	reset: () => void;

	/** Trigger the challenge. */
	execute: () => Promise<void>;

	/** Destroy the widget and release its resources. */
	destroy: () => void;

	/** Render manually when autoRender is disabled or after destroy(). */
	render: () => Promise<void>;

	/** Get the provider response; its empty value depends on the provider. */
	getResponse: () => TResponse;

	getComponentState: () => CaptchaState;
}

export interface CaptchaState {
	loading: boolean;
	error: Error | null;
	ready: boolean;
}

export interface CaptchaCallbacks<TSolve = string, TError = Error | string> {
	onReady?: () => void;

	onSolve?: (token: TSolve) => void;

	onError?: (error: TError) => void;
}

export type CaptchaResponse = string | object | false | null;

export type ProviderClass<
	TOptions = unknown,
	TResponse = string,
	TSolve = TResponse,
	TExtraHandle extends object = CaptchaHandle<TResponse>,
> = new (identifier: string, scriptOptions?: ScriptOptions) => Provider<TOptions, TExtraHandle, TResponse, TSolve>;

export type RuntimeProviderClass = new (
	identifier: string,
	scriptOptions?: ScriptOptions,
) => Provider<object, CaptchaHandle<CaptchaResponse>, CaptchaResponse, never>;

export abstract class Provider<
	TOptions = unknown,
	TExtraHandle extends object = Record<string, never>,
	TResponse = string,
	TSolve = TResponse,
> {
	protected config: ProviderConfig;
	protected identifier: string;

	constructor(config: ProviderConfig, identifier: string) {
		this.config = config;
		this.identifier = identifier;
	}

	protected async loadProviderScript(
		options: LoadScriptOptions = {},
		defaultUrl = this.config.scriptUrl,
	): Promise<void> {
		if (this.config.scriptOptions?.autoLoad === false) return;

		await loadScript(this.config.scriptOptions?.overrideScriptUrl ?? defaultUrl, {
			...options,
			scriptOptions: this.config.scriptOptions,
		});
	}

	/** Initialize the provider and load its scripts. */
	abstract init(): Promise<void>;

	/** Render into the element and return the widget ID. */
	abstract render(
		element: HTMLElement,
		options?: TOptions,
		callbacks?: CaptchaCallbacks<TSolve>,
	): WidgetId | undefined | Promise<WidgetId>;

	abstract reset(widgetId: WidgetId): void;

	abstract execute(widgetId: WidgetId): Promise<void>;

	abstract destroy(widgetId: WidgetId): void;

	abstract getResponse(widgetId: WidgetId): TResponse;

	getHandle(widgetId: WidgetId): CaptchaHandle<TResponse> & TExtraHandle {
		return this.getCommonHandle(widgetId) as CaptchaHandle<TResponse> & TExtraHandle;
	}

	/** Common methods used by provider-specific handles. */
	protected getCommonHandle(widgetId: WidgetId): CaptchaHandle<TResponse> {
		return {
			reset: () => this.reset(widgetId),
			execute: () => this.execute(widgetId),
			destroy: () => this.destroy(widgetId),
			render: async () => {
				console.warn("[better-captcha] render() called on base handle - this should be overridden by the component");
			},
			getResponse: () => this.getResponse(widgetId),
			getComponentState: () => ({
				loading: false,
				error: null,
				ready: false,
			}),
		};
	}
}
