import { postJson } from "../http";
import type { VerificationResult } from "../result";
import {
	asBoolean,
	assertNonEmptyString,
	type BaseVerifyOptions,
	finalizeVerification,
	getOptionalObjectString,
	withFallbackErrorCodes,
} from "../shared";

const PROVIDER = "friendly-captcha";
const DEFAULT_ENDPOINT = "https://global.frcapi.com/api/v2/captcha/siteverify";

export type FriendlyCaptchaErrorCode =
	| "auth_required"
	| "auth_invalid"
	| "response_missing"
	| "response_invalid"
	| "response_timeout"
	| "response_duplicate"
	| "sitekey_invalid"
	| "verification_failed";

export interface FriendlyCaptchaSuccessData {
	response: {
		valid: boolean;
	};
}

export type FriendlyCaptchaVerificationResult = VerificationResult<
	FriendlyCaptchaSuccessData,
	FriendlyCaptchaErrorCode
>;

export interface FriendlyCaptchaVerifyOptions
	extends BaseVerifyOptions<FriendlyCaptchaSuccessData, FriendlyCaptchaErrorCode> {
	apiKey: string;
	sitekey?: string;
	endpoint?: string;
}

export async function verifyFriendlyCaptcha(
	options: FriendlyCaptchaVerifyOptions,
): Promise<FriendlyCaptchaVerificationResult> {
	assertNonEmptyString(options.apiKey, "apiKey", PROVIDER);
	assertNonEmptyString(options.response, "response", PROVIDER);

	const payload: Record<string, unknown> = {
		response: options.response,
	};

	if (options.sitekey) {
		payload.sitekey = options.sitekey;
	}

	const raw = await postJson({
		url: options.endpoint ?? DEFAULT_ENDPOINT,
		body: payload,
		provider: PROVIDER,
		fetcher: options.fetcher,
		signal: options.signal,
		timeoutMs: options.timeoutMs,
		headers: {
			"x-api-key": options.apiKey,
		},
	});

	const success = asBoolean(raw.success, PROVIDER);

	if (!success) {
		const errorCode = getOptionalObjectString(raw.error, "error_code");
		return finalizeVerification(options, {
			success: false,
			errorCodes: withFallbackErrorCodes<FriendlyCaptchaErrorCode>(errorCode ? [errorCode] : [], "verification_failed"),
			raw,
		});
	}

	return finalizeVerification(options, {
		success: true,
		data: {
			response: {
				valid: true,
			},
		},
		raw,
	});
}
