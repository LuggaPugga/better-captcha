declare global {
	interface Window {
		initGeetest4: Geetest.GeetestInitFn;
	}
}

export declare namespace Geetest {
	export type GeetestInitFn = (
		config: Geetest.RenderParameters,
		callback: (captchaObj: Geetest.Geetest) => void,
	) => void;

	export interface ValidateResult {
		lot_number: string;
		captcha_output: string;
		pass_token: string;
		gen_time: string;
	}

	export interface ValidateFailResponse {
		captcha_id: string;
		captcha_type: string;
		challenge: string;
	}

	export enum GeetestErrorType {
		/** Invalid captcha ID. */
		ConfigIdError = 60001,
		/** Expected an ID selector or DOM element. */
		AppendToError = 60002,
		/** /load request failed. */
		LoadError = 60100,
		/** /verify request failed. */
		VerifyError = 60101,
		/** Skin loading failed. */
		SkinLoadError = 60200,
		/** Language pack loading failed. */
		LanguagePackLoadError = 60201,
		/** Verification image loading failed. */
		ImageLoadError = 60202,
		/** gacptcha4 resource loading timed out. */
		GeeTest4ResourceTimeout = 60204,
		/** gct4 resource loading timed out. */
		GCT4ResourceTimeout = 60205,
		/** Server denied access. */
		ServerForbidden = 60500,
	}

	interface GeetestError {
		code: GeetestErrorType;
		msg: string;
		desc: { detail: string };
	}

	export interface Geetest {
		/** Insert the verification button into an ID selector or DOM element. */
		appendTo(element: string | HTMLElement): void;
		/** Return the fields needed for server verification after success, otherwise false. */
		getValidate(): Geetest.ValidateResult | false;
		/** Reset after success or failure. In bind mode, showCaptcha() resets automatically after success. */
		reset(): void;
		/** Start verification in bind mode. */
		showCaptcha(): void;
		/** Called when the verification button DOM is ready. */
		onReady(callback: () => void): void;
		/** Called when the next verification resources finish loading. */
		onNextReady(callback: () => void): void;
		/** Called after successful verification. */
		onSuccess(callback: () => void): void;
		/** Called after failed verification. */
		onFail(callback: (failObj: ValidateFailResponse) => void): void;
		/** Called with the verification error. */
		onError(callback: (error: Geetest.GeetestError) => void): void;
		/** Called when the popup closes. */
		onClose(callback: () => void): void;
		/** Remove the UI and registered event listeners. */
		destroy(): void;
	}

	/** Display mode: floating button, popup, or programmatic verification (bind). Defaults to float. */
	type ProductType = "float" | "popup" | "bind";

	/** Script protocol. Defaults to the current page protocol. */
	type Protocol = "http://" | "https://";

	/** Controls that can be hidden. */
	type BarType = "close" | "refresh";

	interface MaskOptions {
		outside?: boolean;
		bgColor?: string;
	}

	/** Options for window.initGeetest4. */
	export interface RenderParameters {
		/** Captcha ID provided by Geetest. */
		captchaId: string;
		/** Display mode. Defaults to float. */
		product?: ProductType;

		/** CSS properties for the Geetest button. */
		nativeButton?: CSSStyleDeclaration;

		/** Overall scale. Defaults to 1. */
		rem?: number;

		/** Defaults to the browser language, falling back to Chinese if unsupported. */
		language?:
			| "zho"
			| "eng"
			| "zho-tw"
			| "zho-hk"
			| "udm"
			| "jpn"
			| "ind"
			| "kor"
			| "rus"
			| "ara"
			| "spa"
			| "pon"
			| "por"
			| "fra"
			| "deu";

		/** Script protocol. Defaults to the current page protocol. */
		protocol?: Protocol;

		/** Request timeout in milliseconds. Defaults to 30000. */
		timeout?: number;

		/** Hide the close or refresh controls. */
		hideBar?: BarType[];

		/** Popup mask behavior and background color. */
		mask?: MaskOptions;

		/** Custom API servers. Defaults to the official Geetest servers. */
		apiServers?: string[];

		/** Popup width. Disables automatic width adjustment. */
		nextWidth?: string;

		/** Verification form for risk control fusion. */
		riskType?: string;

		/** Hide the success popup in bind mode. */
		hideSuccess?: boolean;

		/** Replace the default offline handling. */
		offlineCb?: () => void;

		/** Called for errors before initialization. */
		onError?: (error: string) => void;

		/** Client information, such as an account, phone number, or username. */
		userInfo?: string;
	}
}

export interface RenderParameters extends Geetest.RenderParameters {}
