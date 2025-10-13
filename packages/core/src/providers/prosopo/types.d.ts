// https://docs.prosopo.io/en/basics/client-side-rendering/

export type WidgetApi = {
	/** Render a new widget into the DOM. */
	render: RenderWidgetFunction;
	/** Reset all widgets. */
	reset: () => void;
	/** Execute the verification process. */
	execute: () => void;
	/** Ready function to initialize when DOM is ready. */
	ready: (fn: () => void) => void;
};

export type RenderWidgetFunction = (element: HTMLElement, options: RenderParameters) => void;

export type CaptchaType = "frictionless" | "pow" | "image";

// auto is not natively supported by the Prosopo API, but it is supported by the react-captcha library.
export type Theme = "light" | "dark" | "auto";

export type CallbackFunction = (output: string) => void;

export type RenderParameters = {
	/** The site key for the widget. */
	siteKey: string;
	/** The type of CAPTCHA to render. Defaults to frictionless. */
	captchaType?: CaptchaType;
	/** The theme of the widget. Defaults to light. */
	theme?: Theme;
	/** Called with the response token after successful verification. */
	callback?: string | CallbackFunction;
	/** Called when an error occurs. */
	"error-callback"?: string | CallbackFunction;
	/** Called when the CAPTCHA challenge expires. */
	"chalexpired-callback"?: string | CallbackFunction;
	/** Called when the CAPTCHA is closed. */
	"close-callback"?: string | CallbackFunction;
	/** Called when the CAPTCHA is opened. */
	"open-callback"?: string | CallbackFunction;
	/** Called when the CAPTCHA solution expires. */
	"expired-callback"?: string | CallbackFunction;
	/** Called when the CAPTCHA challenge fails. */
	"failed-callback"?: string | CallbackFunction;
	/** Called when the CAPTCHA is reset. */
	"reset-callback"?: string | CallbackFunction;
	/** The language of the CAPTCHA widget. Defaults to en. */
	language?: string;
	/** Whether to use Web3 mode. */
	web3?: boolean;
	/** Size of the widget. */
	size?: "normal" | "invisible";
};
