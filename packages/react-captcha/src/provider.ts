export interface ProviderConfig {
	scriptUrl: string;
}

export type WidgetId = string | number;

export interface CaptchaHandle {
	reset: () => void;
	execute: () => Promise<void>;
	destroy: () => void;
	getResponse: () => string;
}

export abstract class Provider<
	TConfig extends ProviderConfig,
	TOptions = unknown,
	TExtraHandle extends object = Record<string, never>,
> {
	protected config: TConfig;
	protected sitekey: string;

	constructor(config: TConfig, sitekey: string) {
		this.config = config;
		this.sitekey = sitekey;
	}

	abstract init(): Promise<void>;

	abstract render(
		element: HTMLElement,
		options?: TOptions,
	): WidgetId | undefined | Promise<WidgetId>;

	abstract reset(widgetId: WidgetId): void;

	abstract execute(widgetId: WidgetId): Promise<void>;

	abstract destroy(widgetId: WidgetId): void;

	abstract getResponse(widgetId: WidgetId): string;

	getHandle(widgetId: WidgetId): CaptchaHandle & TExtraHandle {
		return this.getCommonHandle(widgetId) as CaptchaHandle & TExtraHandle;
	}

	protected getCommonHandle(widgetId: WidgetId): CaptchaHandle {
		return {
			reset: () => this.reset(widgetId),
			execute: () => this.execute(widgetId),
			destroy: () => this.destroy(widgetId),
			getResponse: () => this.getResponse(widgetId),
		};
	}
}
