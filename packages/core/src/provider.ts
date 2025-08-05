export interface ProviderConfig {
	scriptUrl: string;
}

export abstract class Provider<T extends ProviderConfig> {
	protected config: T;
	protected sitekey: string;

	constructor(config: T, sitekey: string) {
		this.config = config;
		this.sitekey = sitekey;
	}

	abstract init(): Promise<void>;

	abstract render(
		element: HTMLElement,
		options?: unknown,
	): string | number | undefined | Promise<string | number>;

	abstract reset(widgetId: string | number): void;

	abstract execute(widgetId: string | number): Promise<void>;
}
