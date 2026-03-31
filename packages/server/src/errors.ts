export type CaptchaServerErrorCode =
	| "invalid-argument"
	| "invalid-runtime"
	| "network-error"
	| "http-error"
	| "invalid-response";

export interface CaptchaServerErrorOptions {
	provider?: string;
	status?: number;
	cause?: unknown;
}

export class CaptchaServerError extends Error {
	readonly code: CaptchaServerErrorCode;
	readonly provider?: string;
	readonly status?: number;
	override readonly cause?: unknown;

	constructor(code: CaptchaServerErrorCode, message: string, options?: CaptchaServerErrorOptions) {
		super(message);
		this.name = "CaptchaServerError";
		this.code = code;
		this.provider = options?.provider;
		this.status = options?.status;
		this.cause = options?.cause;
	}
}

export function isCaptchaServerError(value: unknown): value is CaptchaServerError {
	return value instanceof CaptchaServerError;
}
