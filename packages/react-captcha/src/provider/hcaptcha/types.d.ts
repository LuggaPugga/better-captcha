declare global {
	interface Window {
		hcaptcha: HCaptcha.HCaptcha;
	}
}

/**
 * Parameters for the hcaptcha.render() method.
 */
export interface RenderParameters {
	/**
	 * Required. Your public API sitekey.
	 */
	sitekey: string;

	/**
	 * Optional. Set the color theme of the widget.
	 * Accepted values: "light", "dark"
	 * @default "light"
	 */
	theme?: "light" | "dark" | undefined;

	/**
	 * Optional. Set the size of the widget.
	 * Accepted values: "normal", "compact"
	 * @default "normal"
	 */
	size?: "normal" | "compact" | undefined;

	/**
	 * Optional. Set the tabindex of the widget and popup. When appropriate, can make navigation more intuitive on your site.
	 * @default 0
	 */
	tabindex?: number | undefined;

	/**
	 * Optional. Called when the user submits a successful response. The h-captcha-response token is passed to your callback.
	 */
	callback?: (token: string) => void;

	/**
	 * Optional. Called when the passcode response expires and the user must re-verify.
	 */
	"expired-callback"?: VoidFunction;

	/**
	 * Optional. Called when the user display of a challenge times out with no answer.
	 */
	"chalexpired-callback"?: VoidFunction;

	/**
	 * Optional. Called when the user display of a challenge starts.
	 */
	"open-callback"?: VoidFunction;

	/**
	 * Optional. Called when the user dismisses a challenge.
	 */
	"close-callback"?: VoidFunction;

	/**
	 * Optional. Called when hCaptcha encounters an error and cannot continue. If you specify an error callback, you must inform the user that they should retry.
	 */
	"error-callback"?: (error?: string | Error) => void;

	/**
	 * Optional. Used to dictate the rotation of the hCaptcha challenge presented based on the device's orientation. Only officially supported for Enterprise.
	 * Accepted values: "portrait", "landscape"
	 */
	orientation?: "portrait" | "landscape" | undefined;
}

export declare namespace HCaptcha {
	interface HCaptcha {
		/**
		 * Invokes a Turnstile widget and returns the ID of the newly created widget.
		 * @param container The HTML element to render the Turnstile widget into. Specify either the ID of HTML element (string), or the DOM element itself.
		 * @param params An object containing render parameters as key=value pairs, for example, {"sitekey": "your_site_key", "theme": "auto"}.
		 * @return the ID of the newly created widget, or undefined if invocation is unsuccessful.
		 */
		render(
			container: string | HTMLElement,
			params: RenderParameters,
		): string | undefined;

		/**
		 * Resets a Turnstile widget.
		 * @param widgetId The ID of the Turnstile widget to be reset.
		 */
		reset(widgetId: string): void;

		/**
		 * remove a Turnstile widget.
		 * @param widgetId The ID of the Turnstile widget to be removed.
		 */
		remove(widgetId: string): void;

		/**
		 * Gets the response of a Turnstile widget.
		 * @param widgetId The ID of the Turnstile widget to get the response for.
		 * @return the response of the Turnstile widget.
		 */
		getResponse(widgetId: string): string;

		/**
		 * Triggers the hCaptcha workflow programmatically. Generally used in invisible mode where the target container is a div rather than a button.
		 * @param widgetId Optional unique ID for a widget. Defaults to first widget created.
		 */
		execute(widgetId?: string): void;

		/**
		 * Triggers the hCaptcha workflow programmatically in asynchronous mode.
		 * @param widgetId Optional unique ID for a widget. Defaults to first widget created.
		 * @param options Configuration object with async: true to get a Promise back.
		 * @return Promise that resolves with an object containing the token and response key, or rejects with an error code.
		 */
		execute(
			widgetId: string | undefined,
			options: { async: true },
		): Promise<{ response: string; key: string }>;
	}
}
