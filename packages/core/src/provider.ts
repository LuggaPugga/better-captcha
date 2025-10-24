export interface ProviderConfig {
	scriptUrl: string;
}

export type WidgetId = string | number;

/**
 * Imperative handle interface for CAPTCHA components
 *
 * Provides methods to programmatically control the CAPTCHA widget
 * and access its current state. All providers implement this interface
 * with additional provider-specific methods.
 */
export interface CaptchaHandle {
	/**
	 * Reset the widget to its initial state
	 * Clears any previous responses and restarts the challenge
	 */
	reset: () => void;

	/**
	 * Programmatically trigger the challenge
	 * @returns Promise that resolves when execution is complete
	 */
	execute: () => Promise<void>;

	/**
	 * Destroy the widget and clean up resources
	 * Removes the widget from the DOM and clears any event listeners
	 */
	destroy: () => void;

	/**
	 * Render the captcha widget
	 * Useful when autoRender is disabled or after destroying the widget
	 * @returns Promise that resolves when rendering is complete
	 */
	render: () => Promise<void>;

	/**
	 * Get the current response token from the widget
	 * @returns The response string, empty if no challenge has been completed
	 */
	getResponse: () => string;

	/**
	 * Get the current component state
	 * @returns Object containing loading, error, and ready states
	 */
	getComponentState: () => CaptchaState;
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
	abstract render(element: HTMLElement, options?: TOptions): WidgetId | undefined | Promise<WidgetId>;

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
