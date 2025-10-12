declare global {
	interface Window {
		privateCaptcha: PrivateCaptcha.PrivateCaptcha;
	}
}

export declare namespace PrivateCaptcha {
	export interface CaptchaWidget {
		reset(options?: Partial<RenderParameters>): void;
		execute(): Promise<never>;
		solution(): string;
		updateStyles(): void;
	}

	export interface CaptchaEventDetail {
		widget: CaptchaWidget;
		element: HTMLElement;
	}

	export interface PrivateCaptcha {
		/**
		 * Sets up Private Captcha on the page
		 */
		setup(): void;

		/**
		 * Renders a captcha widget and returns the widget instance
		 * @param element The HTML element to render the captcha into
		 * @param options Render parameters
		 * @returns The widget instance or null if already attached
		 */
		render(element: HTMLElement, options?: RenderParameters): CaptchaWidget | null;

		/**
		 * Gets the response/solution from a captcha widget
		 * @param widget The widget instance, or uses autoWidget if not provided
		 * @returns The captcha solution string
		 */
		getResponse(widget?: CaptchaWidget): string;

		/**
		 * Resets a captcha widget
		 * @param widget The widget instance, or uses autoWidget if not provided
		 */
		reset(widget?: CaptchaWidget): void;

		/**
		 * The automatically created widget (when render mode is not "explicit")
		 */
		autoWidget?: CaptchaWidget;
	}

	/**
	 * Parameters for the privateCaptcha.render() method
	 */
	export interface RenderParameters {
		/**
		 * Your Private Captcha sitekey
		 */
		sitekey: string;

		/**
		 * Optional. Callback invoked when the captcha is initialized
		 */
		onInit?: (detail: CaptchaEventDetail) => void;

		/**
		 * Optional. Callback invoked when an error occurs
		 */
		onError?: (detail: CaptchaEventDetail) => void;

		/**
		 * Optional. Callback invoked when solving starts
		 */
		onStart?: (detail: CaptchaEventDetail) => void;

		/**
		 * Optional. Callback invoked when solving finishes
		 */
		onFinish?: (detail: CaptchaEventDetail) => void;

		/**
		 * Optional. The widget theme
		 * @default "light"
		 */
		theme?: "light" | "dark";

		/**
		 * Optional. When to start solving the captcha
		 * @default "auto"
		 */
		startMode?: "click" | "auto";

		/**
		 * Optional. Enable debug mode
		 * @default false
		 */
		debug?: boolean;

		/**
		 * Optional. The name of the hidden input field for the solution
		 * @default "private-captcha-solution"
		 */
		fieldName?: string;

		/**
		 * Optional. Custom puzzle endpoint URL
		 */
		puzzleEndpoint?: string;

		/**
		 * Optional. Display mode for the widget
		 * @default "widget"
		 */
		displayMode?: "widget" | "popup" | "hidden";

		/**
		 * Optional. Language code (ISO 639-1)
		 * @default "en"
		 */
		lang?: string;

		/**
		 * Optional. Custom CSS styles to apply to the widget
		 */
		styles?: string;

		/**
		 * Optional. Variable name to store the widget instance on the element
		 */
		storeVariable?: string;

		/**
		 * Optional. Use EU-only endpoint
		 * @default false
		 */
		eu?: boolean;

		/**
		 * Optional. Compatibility mode
		 */
		compat?: "recaptcha";
	}
}

interface RenderParameters extends PrivateCaptcha.RenderParameters {}
export { PrivateCaptcha, type RenderParameters };
