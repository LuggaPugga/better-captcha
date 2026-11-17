export interface RenderParameters {
	/** Public URL of your FCaptcha server. No verification secret belongs in the browser. */
	serverUrl: string;
	action?: string;
	cdata?: string;
	/** Minimum observation time in milliseconds. Defaults to FCaptcha's 2000 ms. */
	minCollectionTime?: number;
	/** Execution deadline in milliseconds; defaults to 30000. Maximum 300000. */
	executionTimeout?: number;
	responseField?: boolean;
	responseFieldName?: string;
}

export interface FCaptchaResult {
	success: boolean;
	token?: string;
}

export interface FCaptchaSession {
	id: string;
	execute(action?: string, cdata?: string): Promise<FCaptchaResult>;
	destroy(): void;
}

export interface FCaptchaApi {
	invisible(options: {
		siteKey: string;
		serverUrl: string;
		minCollectionTime?: number;
		autoScore: false;
	}): FCaptchaSession;
}
