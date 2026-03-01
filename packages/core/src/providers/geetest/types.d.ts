declare global {
	interface Window {
    initGeetest: Geetest.GeetestInitFn;
	}
}

export declare namespace Geetest {
  export type GeetestInitFn = (config: Geetest.RenderParameters, callback: (captchaObj: Geetest.Geetest) => void) => void;

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

  export const enum GeetestErrorType {
    /** Invalid captcha_id configuration parameter: Please check the captcha_id passed during initialization (corresponding to the ID at application time) */
    ConfigIdError = 60001,
    /** Invalid parameters for appendTo interface: only accepts id selectors and DOM elements */
    AppendToError = 60002,
    /** /load request error: 1. Keep network connection stable; 2. Check the captchaId parameter passed during initialization */
    LoadError = 60100,
    /** /verify request error: 1. Keep network connection stable; 2. Contact GeeTest customer service */
    VerifyError = 60101,
    /** Skin loading failed: 1. Keep network connection stable; 2. Contact GeeTest customer service */
    SkinLoadError = 60200,
    /** Language pack loading failed: 1. Keep network connection stable; 2. Contact GeeTest customer service */
    LanguagePackLoadError = 60201,
    /** Verification image loading failed: 1. Keep network connection stable; 2. Contact GeeTest customer service */
    ImageLoadError = 60202,
    /** (gacptcha4) JavaScript resource loading timeout: 1. Keep network connection stable; 2. Contact GeeTest customer service */
    GeeTest4ResourceTimeout = 60204,
    /** (gct4) JavaScript resource loading timeout: 1. Keep network connection stable; 2. Contact GeeTest customer service */
    GCT4ResourceTimeout = 60205,
    /** Server forbidden: Please contact GeeTest customer service */
    ServerForbidden = 60500,
  }

  interface GeetestError {
    code: GeetestErrorType;
    msg: string;
    desc: { detail: string };
  }
  
  export interface Geetest {
    /**
     * The appendTo method inserts the verification button into the host page to display it on the page.
     * @param element An id selector (e.g., #captcha-box) or a DOM element object
     */
    appendTo(element: string | HTMLElement): void;
    /**
     * Get the result obtained from successful verification (onSuccess), which is used for server-side SDK for secondary verification.
     * @returns Returns an object containing fields required for verification. In other cases, returns false. Therefore, website developers can also decide whether to perform the next step of operation (submit a form or use ajax for secondary verification) based on the return value.
     */
    getValidate(): Geetest.ValidateResult | false;
    /**
     * Reset the verification to its initial state. This is generally used when the user's backend discovers that verification was successful but other information is incorrect (e.g., wrong username or password), or when verification encounters an error. Therefore, this interface can only be called effectively when verification succeeds or fails. For bind mode, calling showCaptcha again after success will automatically reset without manual invocation.
     */
    reset(): void;
    /**
     * When product is of bind type, you can call this interface to perform verification.
     */
    showCaptcha(): void;
    /**
     * Listen for the event when the verification button's DOM generation is complete.
     * @param callback A function type parameter that will be called when the verification button's DOM generation is complete.
     */
    onReady(callback: () => void): void;
    /**
     * Listen for the event when the next step of verification resource loading is complete. The callback parameter is of function type.
     * @param callback A function type parameter that will be called when the next step of verification resource loading is complete.
     */
    onNextReady(callback: () => void): void;
    /**
     * Listen for verification success event.
     * @param callback A function type parameter that will be called when verification succeeds.
     */
    onSuccess(callback: () => void): void;
    /**
     * Listen for verification failure event.
     * @param callback A function type parameter that will be called when verification fails, and an object parameter containing information about the verification failure will be passed in. Developers can perform corresponding processing based on this information, such as logging, prompting users, etc.
     */
    onFail(callback: (failObj: ValidateFailResponse) => void): void;
    /**
     * Listen for verification error event. The callback parameter is of function type.
     * @param callback A function type parameter that will be called when verification encounters an error, and an object parameter containing information about the verification error (such as error code, error message, etc.) will be passed in.
     */
    onError(callback: (error: Geetest.GeetestError) => void): void;
    /**
     * When the user closes the popup verification, this callback will be triggered.
     * @param callback A function type parameter that will be called when the user closes the popup verification. Developers can perform some cleanup work in this function, such as resetting verification status, hiding relevant prompt information, etc., to ensure a consistent and smooth user experience.
     */
    onClose(callback: () => void): void;
    /**
     * Destroy the verification instance. The verification-related UI and all registered event listeners will be removed.
     */
    destroy(): void;
  }

  /**
   * The type of captcha to render. Valid values are "float", "popup", and "bind". This parameter is optional and defaults to "float".
   * - "float": The captcha will be displayed as a floating element on the page.
   * - "popup": The captcha will be displayed in a popup window when the user interacts with the target element.
   * - "bind": The captcha will be bound to a specific element and will be displayed when the user interacts with that element. 
   */
  type ProductType = "float" | "popup" | "bind";

  /**
   * The protocol to use when loading the Geetest script. Valid values are "http://" and "https://". This parameter is optional and defaults to the protocol of the current page. If the value is not provided, the script will be loaded using the same protocol as the page (i.e., if the page is loaded over HTTPS, the script will also be loaded over HTTPS).
   */
  type Protocol = 'http://' | 'https://';

  /**
   * The type of the bar that can be hidden in the captcha interface. Valid values are "close" and "refresh". This parameter is optional and can be used to customize the appearance of the captcha interface by hiding certain elements. If set to "close", the close button on the captcha interface will be hidden, preventing users from closing the captcha window. If set to "refresh", the refresh button will be hidden, preventing users from refreshing the captcha challenge. Please note that hiding these elements may affect the user experience, so it should be used with caution based on your specific requirements.
   */
  type BarType = 'close' | 'refresh';


  interface MaskOptions {
    outside?: boolean;
    bgColor?: string;
  }

	/**
	 * Parameters for the window.initGeetest method.
	 */
	export interface RenderParameters {
    /**
     * The captcha ID provided by Geetest. This is a required parameter.
     */
    captchaId: string;
    /**
     * The type of captcha to render. Valid values are "float", "popup", and "bind". This parameter is optional and defaults to "float".
     */
    product?: ProductType;

    /**
     * Geetest button style settings. This is an optional parameter that allows you to customize the appearance of the Geetest button. It should be an object containing CSS style properties and values that will be applied to the Geetest button element.
     */
    nativeButton?: CSSStyleDeclaration;

    /**
     * Set the overall scaling ratio of the captcha, which can be used to adapt to devices with different screen sizes. This parameter is optional and defaults to 1 (i.e., no scaling). For example, if you want to reduce the captcha to half of its original size, you can set this parameter to 0.5; if you want to enlarge the captcha to twice its original size, you can set this parameter to 2. Please note that the scaling ratio will affect the overall size of the captcha, including elements such as the captcha image and input box, so it needs to be adjusted according to actual needs.
     */
    rem?: number;
    
    /**
     * Set the language of the verification interface. If not provided, the language set in the browser will be used by default. If the value is not in the supported list, Chinese will be used by default. Optional values are zho, eng, zho-tw, zho-hk, udm, jpn, ind, kor, rus, ara, spa, pon, por, fra, deu.
     */
    language?: string;

    /**
     * The URL of the Geetest script. This is a required parameter that specifies the URL from which to load the Geetest script. The URL should point to the location of the Geetest JavaScript file provided by Geetest. For example, it could be something like "https://static.geetest.com/static/tools/gt.js". Please ensure that the URL is correct and accessible, as it is necessary for loading the Geetest functionality on your website.
     */
    protocol?: Protocol;

    /**
     * Set the timeout for a single request during the verification process. The default value is 30000 ms (30 seconds). This parameter is optional and can be adjusted based on your needs. If a request takes longer than the specified timeout duration, it will be aborted and an error callback will be triggered. Please note that setting a very short timeout may lead to frequent timeouts and errors, while setting a very long timeout may result in a poor user experience if the verification process takes too long. Therefore, it is recommended to set a reasonable timeout value based on the expected response times of your server and network conditions.
     */
    timeout?: number;

    /**
     * The type of the bar that can be hidden in the captcha interface. Valid values are "close" and "refresh". This parameter is optional and can be used to customize the appearance of the captcha interface by hiding certain elements. If set to "close", the close button on the captcha interface will be hidden, preventing users from closing the captcha window. If set to "refresh", the refresh button will be hidden, preventing users from refreshing the captcha challenge. Please note that hiding these elements may affect the user experience, so it should be used with caution based on your specific requirements.
     */
    hideBar?: BarType[];

    /**
     * Mask options for the captcha interface. This is an optional parameter that allows you to customize the appearance of the captcha interface by applying a mask. The mask can be used to dim the background and focus the user's attention on the captcha challenge. The MaskOptions object can include properties such as "outside" (a boolean indicating whether to apply the mask outside the captcha area) and "bgColor" (a string specifying the background color of the mask, e.g., "rgba(0, 0, 0, 0.5)" for a semi-transparent black mask). By configuring these options, you can enhance the visual presentation of the captcha and improve user engagement.
     */
    mask?: MaskOptions;

    /**
     * The API server addresses for the captcha verification process. This is an optional parameter that allows you to specify custom API server addresses for the captcha verification process. By default, the Geetest SDK will use the official Geetest API servers for verification. However, if you have specific requirements or want to use your own backend servers for verification, you can provide an array of API server URLs through this parameter. The SDK will then send verification requests to the specified servers instead of the default ones. Please ensure that the provided API server addresses are correct and properly configured to handle verification requests, as this will affect the functionality of the captcha on your website.
     */
    apiServers?: string[];

    /**
     * The width of the captcha popup dialog. (After this parameter is set, the captcha popup will not automatically adjust its width based on the webpage content width)
     */
    nextWidth?: string;

    /**
     * Combined with risk control fusion to specify the verification form
     */
    riskType?: string;

    /**
     * Hide the verification success popup in bind display mode (Note: This only takes effect when the product parameter value is bind)
     */
    hideSuccess?: boolean;

    /**
     * Offline mode handling function. By default, it uses GeeTest's offline mode. Setting this function means you want to customize the offline logic (the default offline mode will not be executed again).
     * @returns void
     */
    offlineCb?: () => void;

    /**
     * Error capture before initialization of the captcha
     * @param error The error information
     * @returns void
     */
    onError?: (error: string) => void;

    /**
     * Client information, such as user account, user phone number, username, etc.
     */
    userInfo?: string;
	}
}

interface RenderParameters extends Geetest.RenderParameters {}
export { type Geetest, type RenderParameters };
