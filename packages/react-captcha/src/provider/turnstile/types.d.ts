// modified from: https://gist.github.com/suhaotian/c2851d1938da31d349e8cfe65c97c47e#file-turnslite-d-ts

declare global {
	interface Window {
		turnstile: Turnstile.Turnstile;
	}
}

/**
 * The theme of the Turnstile widget.
 * The default is "auto", which respects the user preference. This can be forced to "light" or "dark" by setting the theme accordingly.
 */
export type Theme = "auto" | "light" | "dark";

/**
 * Parameters for the turnstile.render() method.
 * @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#configurations
 */
export interface RenderParameters {
	/**
	 * Every widget has a sitekey. This sitekey is associated with the corresponding widget configuration and is created upon the widget creation.
	 */
	sitekey: string;

	/**
	 * Optional. A customer value that can be used to differentiate widgets under the same sitekey in analytics and which is returned upon validation. This can only contain up to 32 alphanumeric characters including _ and -.
	 */
	action?: string | undefined;

	/**
	 * Optional. A customer payload that can be used to attach customer data to the challenge throughout its issuance and which is returned upon validation. This can only contain up to 255 alphanumeric characters including _ and -.
	 */
	cData?: string | undefined;

	/**
	 * Optional. A JavaScript callback invoked upon success of the challenge. The callback is passed a token that can be validated.
	 */
	callback?: (token: string) => void;

	/**
	 * Optional. A JavaScript callback invoked when there is an error (e.g. network error or the challenge failed).
	 */
	"error-callback"?: (error?: string | Error) => void;

	/**
	 * Optional. Execution controls when to obtain the token of the widget and can be on render (default) or on execute.
	 */
	execution?: "render" | "execute" | undefined;

	/**
	 * Optional. A JavaScript callback invoked when the token expires and does not reset the widget.
	 */
	"expired-callback"?: VoidFunction;

	/**
	 * Optional. A JavaScript callback invoked before the challenge enters interactive mode.
	 */
	"before-interactive-callback"?: VoidFunction;

	/**
	 * Optional. A JavaScript callback invoked when challenge has left interactive mode.
	 */
	"after-interactive-callback"?: VoidFunction;

	/**
	 * Optional. A JavaScript callback invoked when a given client/browser is not supported by Turnstile.
	 */
	"unsupported-callback"?: VoidFunction;

	/**
	 * Optional. The widget theme. Can take the following values: light, dark, auto.
	 * The default is auto, which respects the user preference. This can be forced to light or dark by setting the theme accordingly.
	 * @default "auto"
	 */
	theme?: Theme | undefined;

	/**
	 * Optional. Language to display, must be either: auto (default) to use the language that the visitor has chosen, or an ISO 639-1 two-letter language code (e.g. en) or language and country code (e.g. en-US).
	 */
	language?: string | undefined;

	/**
	 * Optional. The tabindex of Turnstile's iframe for accessibility purposes.
	 * @default 0
	 */
	tabindex?: number | undefined;

	/**
	 * Optional. A JavaScript callback invoked when the challenge presents an interactive challenge but was not solved within a given time. A callback will reset the widget to allow a visitor to solve the challenge again.
	 */
	"timeout-callback"?: VoidFunction;

	/**
	 * Optional. A boolean that controls if an input element with the response token is created.
	 * @default true
	 */
	"response-field"?: boolean | undefined;

	/**
	 * Optional. Name of the input element.
	 * @default "cf-turnstile-response"
	 */
	"response-field-name"?: string | undefined;

	/**
	 * Optional. The widget size. Can take the following values: normal, flexible, compact.
	 */
	size?: "normal" | "flexible" | "compact" | undefined;

	/**
	 * Optional. Controls whether the widget should automatically retry to obtain a token if it did not succeed. The default is auto, which will retry automatically. This can be set to never to disable retry on failure.
	 * @default "auto"
	 */
	retry?: "auto" | "never" | undefined;

	/**
	 * Optional. When retry is set to auto, retry-interval controls the time between retry attempts in milliseconds. Value must be a positive integer less than 900000.
	 * @default 8000
	 */
	"retry-interval"?: number | undefined;

	/**
	 * Optional. Automatically refreshes the token when it expires. Can take auto, manual, or never.
	 * @default "auto"
	 */
	"refresh-expired"?: "auto" | "manual" | "never" | undefined;

	/**
	 * Optional. Controls whether the widget should automatically refresh upon entering an interactive challenge and observing a timeout. Can take auto (automatically refreshes upon encountering an interactive timeout), manual (prompts the visitor to manually refresh) or never (will show a timeout). Only applies to widgets of mode managed.
	 * @default "auto"
	 */
	"refresh-timeout"?: "auto" | "manual" | "never" | undefined;

	/**
	 * Optional. Appearance controls when the widget is visible. It can be always (default), execute, or interaction-only.
	 * @default "always"
	 */
	appearance?: "always" | "execute" | "interaction-only" | undefined;

	/**
	 * Optional. Allows Cloudflare to gather visitor feedback upon widget failure. It can be true (default) or false.
	 * @default true
	 */
	"feedback-enabled"?: boolean | undefined;
}

export declare namespace Turnstile {
	interface Turnstile {
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
		 * Triggers the Turnstile workflow programmatically.
		 * @param widgetId The ID of the Turnstile widget to execute.
		 */
		execute(container: string | HTMLElement, jsParams?: RenderParameters): void;

		RenderParameters: RenderParameters;
	}
}
