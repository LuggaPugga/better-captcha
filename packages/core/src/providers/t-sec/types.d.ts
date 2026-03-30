declare global {
	interface Window {
		TencentCaptcha: typeof GlobalTSec.TencentCaptcha;
	}
}

export declare namespace GlobalTSec {
	export class TencentCaptcha {
		constructor(
			DOM: HTMLElement,
			CaptchaAppId: string,
			callback: TencentCaptchaStateChangeFn,
			options: RenderParameters,
		);

		/**
		 * Displays the captcha and can be called repeatedly.
		 */
		show(): void;

		/**
		 * Hides the captcha and can be called repeatedly.
		 */
		destroy(): void;

		/**
		 * Gets the ticket after successful verification.
		 */
		getTicket(): TencentCaptchaResult;

		/**
		 * Re-initializes the checkbox and can be called repeatedly.
		 */
		reload(): void;
	}

	export interface TencentCaptchaResult {
		/**
		 * Verification ticket. It has a value only when ret = 0.
		 */
		ticket: string;
		/**
		 * Random string for this verification, required for subsequent ticket validation.
		 */
		randStr: string;
		/**
		 * Captcha application ID.
		 */
		CaptchaAppId?: string;
		/**
		 * Custom passthrough parameter.
		 */
		bizState?: unknown;
	}

	export type TencentCaptchaStateChangeFn = (
		res: TencentCaptchaCheckSuccessState | TencentCaptchaCloseCaptchaState,
	) => void;

	export type TencentCaptchaCheckSuccessState = {
		/**
		 * Verification result: 0 for success, 2 when the user actively closes the captcha.
		 */
		ret: 0;
		errCode?: TencentCaptchaErrorCode;
		errorMessage?: string;
	} & TencentCaptchaResult;

	export type TencentCaptchaCloseCaptchaState = {
		/**
		 * Verification result: 0 for success, 2 when the user actively closes the captcha.
		 */
		ret: 2;
		errCode?: TencentCaptchaErrorCode;
		errorMessage?: string;
	};

	export enum TencentCaptchaErrorCode {
		LOAD_ERROR = 1001, // TJNCaptcha-global.js load error
		SHOW_TIMEOUT = 1002, // Calling show method timeout
		LOAD_JS_TIMEOUT = 1003, // Loading intermediate js timeout
		LOAD_JS_ERROR = 1004, // Loading intermediate js error
		RUN_JS_ERROR = 1005, // Running intermediate js error
		FETCH_CAPTCHA_CONFIG_ERROR_OR_TIMEOUT = 1006, // Fetching captcha config error or timeout
		IFRAME_LOAD_TIMEOUT = 1007, // Iframe load timeout
		IFRAME_LOAD_ERROR = 1008, // Iframe load error
		JQUERY_LOAD_ERROR = 1009, // jquery load error
		SLIDE_JS_LOAD_ERROR = 1010, // Slide js load error
		SLIDE_JS_RUN_ERROR = 1011, // Slide js run error
		REFRESH_CAPTCHA_MORE_THAN_THREE_TIMES = 1012, // Refreshing captcha more than three times
		VERIFY_NETWORK_MORE_THAN_THREE_TIMES = 1013, // Verifying network more than three times
	}

	export interface RenderParameters {
		/**
		 * Custom passthrough parameter. Business logic can use this field to pass a small amount of data,
		 * and its content will be included in the callback object.
		 */
		bizState?: unknown;
		/**
		 * Enables adaptive dark mode or forces dark mode.
		 * Enable adaptive dark mode: {"enableDarkMode": true}
		 * Force dark mode: {"enableDarkMode": 'force'}
		 */
		enableDarkMode?: boolean | "force";
		/**
		 * Callback fired when captcha loading is complete. The callback argument contains the actual
		 * captcha width and height:
		 * {"sdkView": {
		 *   "width": number,
		 *   "height": number
		 * }}
		 * This parameter is only for reading the captcha dimensions. Do not use it to set width/height directly.
		 *
		 * @returns The actual width and height of the captcha.
		 */
		ready?: () => { sdkView: { width: number; height: number } };
		/**
		 * Custom help link: {"needFeedBack": 'URL address' }
		 */
		needFeedBack?: string;
		/**
		 * When enabled, safe requests can automatically pass checkbox verification without user interaction.
		 * Disabled by default.
		 * Enable: {"enableAutoCheck":true}
		 */
		enableAutoCheck?: boolean;
		/**
		 * Specifies the language of captcha prompt text, with higher priority than console configuration.
		 * Supports values aligned with navigator.language user preferences and is case-insensitive.
		 */
		userLanguage?:
			| "zh-cn"
			| "zh-hk"
			| "zh-tw"
			| "en"
			| "en-in"
			| "ar"
			| "cs-cz"
			| "de"
			| "es"
			| "es-la"
			| "fr"
			| "fil"
			| "he"
			| "hi"
			| "id"
			| "it"
			| "ja"
			| "ko"
			| "lo"
			| "ms"
			| "my"
			| "nl"
			| "pl"
			| "pt"
			| "pt-pt"
			| "ro-ro"
			| "ru"
			| "th"
			| "tr"
			| "uk-ua"
			| "ur"
			| "vi";
		/**
		 * Defines the captcha display mode.
		 * popup (default): modal style, centered as an overlay.
		 * embed: embedded in the specified container element.
		 */
		type?: "popup" | "embed";
		/**
		 * CaptchaAppId encrypted verification string, optional parameter.
		 */
		aidEncrypted?: string;
		/**
		 * Callback for duration (rendering time) and sid.
		 * @returns Rendering time in milliseconds and sid.
		 */
		showFn?: () => void;
	}
}

export interface RenderParameters extends GlobalTSec.RenderParameters {}
