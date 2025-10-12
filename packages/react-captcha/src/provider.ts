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

/**
 * Current state of the CAPTCHA component
 */
export interface CaptchaState {
	loading: boolean;
	error: Error | null;
	ready: boolean;
}

/**
 * Props for CAPTCHA components
 * @template TOptions - Type of options specific to the CAPTCHA provider
 */
export type CaptchaProps<TOptions> = {
	sitekey: string;
	options?: TOptions;
	className?: string;
	style?: React.CSSProperties;
};

/**
 * Abstract base class for CAPTCHA providers
 * @template TConfig - Configuration type for the provider
 * @template TOptions - Options type for rendering
 * @template TExtraHandle - Additional methods for the handle
 */
export abstract class Provider<
	TConfig extends ProviderConfig,
	TOptions = unknown,
	TExtraHandle extends object = Record<string, never>,
> {
	protected config: TConfig;
	protected sitekey: string;

	/**
	 * Create a new provider instance
	 * @param config - Provider configuration
	 * @param sitekey - Site key for the CAPTCHA service
	 */
	constructor(config: TConfig, sitekey: string) {
		this.config = config;
		this.sitekey = sitekey;
	}

	/**
	 * Initialize the provider (load scripts, etc.)
	 * @returns Promise that resolves when initialization is complete
	 */
	abstract init(): Promise<void>;

	/**
	 * Render the CAPTCHA widget in the specified element
	 * @param element - DOM element to render the widget in
	 * @param options - Provider-specific rendering options
	 * @returns Widget ID or promise resolving to widget ID
	 */
	abstract render(
		element: HTMLElement,
		options?: TOptions,
	): WidgetId | undefined | Promise<WidgetId>;

	/**
	 * Reset the CAPTCHA widget to its initial state
	 * @param widgetId - ID of the widget to reset
	 */
	abstract reset(widgetId: WidgetId): void;

	/**
	 * Programmatically execute the CAPTCHA challenge
	 * @param widgetId - ID of the widget to execute
	 * @returns Promise that resolves when execution is complete
	 */
	abstract execute(widgetId: WidgetId): Promise<void>;

	/**
	 * Destroy the CAPTCHA widget and clean up resources
	 * @param widgetId - ID of the widget to destroy
	 */
	abstract destroy(widgetId: WidgetId): void;

	/**
	 * Get the current CAPTCHA response token
	 * @param widgetId - ID of the widget to get response from
	 * @returns CAPTCHA response token
	 */
	abstract getResponse(widgetId: WidgetId): string;

	/**
	 * Get a handle for controlling the CAPTCHA widget
	 * @param widgetId - ID of the widget
	 * @returns Handle with control methods
	 */
	getHandle(widgetId: WidgetId): CaptchaHandle & TExtraHandle {
		return this.getCommonHandle(widgetId) as CaptchaHandle & TExtraHandle;
	}

	/**
	 * Get the common handle methods for a widget
	 * @param widgetId - ID of the widget
	 * @returns Handle with common control methods
	 */
	protected getCommonHandle(widgetId: WidgetId): CaptchaHandle {
		return {
			reset: () => this.reset(widgetId),
			execute: () => this.execute(widgetId),
			destroy: () => this.destroy(widgetId),
			getResponse: () => this.getResponse(widgetId),
		};
	}
}
