import { postJson } from "../http";
import type { VerificationResult } from "../result";
import {
	asBoolean,
	assertNonEmptyString,
	type BaseVerifyOptions,
	buildProviderFormBody,
	finalizeProviderFailure,
	finalizeVerification,
	getCommonMismatchCodes,
	getOptionalNumber,
	getOptionalString,
	getStringArray,
} from "../shared";

const PROVIDER = "recaptcha";
const DEFAULT_ENDPOINT = "https://www.google.com/recaptcha/api/siteverify";

export type ReCaptchaErrorCode =
	| "missing-input-secret"
	| "invalid-input-secret"
	| "missing-input-response"
	| "invalid-input-response"
	| "bad-request"
	| "timeout-or-duplicate"
	| "hostname-mismatch"
	| "action-mismatch"
	| "score-too-low"
	| "verification-failed";

export interface ReCaptchaSuccessData {
	challengeTs?: string;
	hostname?: string;
	score?: number;
	action?: string;
	apkPackageName?: string;
}

export type ReCaptchaVerificationResult = VerificationResult<ReCaptchaSuccessData, ReCaptchaErrorCode>;

export interface ReCaptchaVerifyOptions extends BaseVerifyOptions<ReCaptchaSuccessData, ReCaptchaErrorCode> {
	secret: string;
	remoteip?: string;
	expectedHostname?: string;
	expectedAction?: string;
	minScore?: number;
	endpoint?: string;
}

export async function verifyReCaptcha(options: ReCaptchaVerifyOptions): Promise<ReCaptchaVerificationResult> {
	assertNonEmptyString(options.secret, "secret", PROVIDER);
	assertNonEmptyString(options.response, "response", PROVIDER);

	const body = buildProviderFormBody(options.secret, options.response, {
		remoteip: options.remoteip,
	});

	const raw = await postJson({
		url: options.endpoint ?? DEFAULT_ENDPOINT,
		body,
		provider: PROVIDER,
		fetcher: options.fetcher,
		signal: options.signal,
		timeoutMs: options.timeoutMs,
	});

	const success = asBoolean(raw.success, PROVIDER);
	const providerErrorCodes = getStringArray(raw["error-codes"]);

	if (!success) {
		return finalizeProviderFailure(options, raw, providerErrorCodes, "verification-failed");
	}

	const hostname = getOptionalString(raw.hostname);
	const action = getOptionalString(raw.action);
	const score = getOptionalNumber(raw.score);
	const mismatches = getCommonMismatchCodes<ReCaptchaErrorCode>({
		expectedHostname: options.expectedHostname,
		hostname,
		hostnameMismatchCode: "hostname-mismatch",
		expectedAction: options.expectedAction,
		action,
		actionMismatchCode: "action-mismatch",
		minScore: options.minScore,
		score,
		scoreTooLowCode: "score-too-low",
	});

	if (mismatches.length > 0) {
		return finalizeVerification(options, {
			success: false,
			errorCodes: mismatches,
			raw,
		});
	}

	return finalizeVerification(options, {
		success: true,
		data: {
			challengeTs: getOptionalString(raw.challenge_ts),
			hostname,
			score,
			action,
			apkPackageName: getOptionalString(raw.apk_package_name),
		},
		raw,
	});
}
