import { postJson } from "../http";
import { readBoolean, readNumber, readRequiredBoolean, readString, readStringArray } from "../json";
import type { VerificationResult } from "../result";
import {
	assertNonEmptyString,
	type BaseVerifyOptions,
	buildProviderFormBody,
	finalizeProviderFailure,
	finalizeVerification,
	getCommonMismatchCodes,
} from "../shared";

const PROVIDER = "hcaptcha";
const DEFAULT_ENDPOINT = "https://api.hcaptcha.com/siteverify";

export type HCaptchaErrorCode =
	| "missing-input-secret"
	| "invalid-input-secret"
	| "missing-input-response"
	| "invalid-input-response"
	| "expired-input-response"
	| "bad-request"
	| "missing-remoteip"
	| "invalid-remoteip"
	| "not-using-dummy-passcode"
	| "sitekey-secret-mismatch"
	| "hostname-mismatch"
	| "action-mismatch"
	| "score-too-low"
	| "verification-failed";

export interface HCaptchaSuccessData {
	challengeTs?: string;
	hostname?: string;
	credit?: boolean;
	score?: number;
	scoreReason?: string[];
}

export type HCaptchaVerificationResult = VerificationResult<HCaptchaSuccessData, HCaptchaErrorCode>;

export interface HCaptchaVerifyOptions extends BaseVerifyOptions<HCaptchaSuccessData, HCaptchaErrorCode> {
	secret: string;
	remoteip?: string;
	sitekey?: string;
	expectedHostname?: string;
	minScore?: number;
	expectedAction?: string;
	endpoint?: string;
}

export async function verifyHCaptcha(options: HCaptchaVerifyOptions): Promise<HCaptchaVerificationResult> {
	assertNonEmptyString(options.secret, "secret", PROVIDER);
	assertNonEmptyString(options.response, "response", PROVIDER);

	const body = buildProviderFormBody(options.secret, options.response, {
		remoteip: options.remoteip,
		sitekey: options.sitekey,
	});

	const raw = await postJson({
		url: options.endpoint ?? DEFAULT_ENDPOINT,
		body,
		provider: PROVIDER,
		fetcher: options.fetcher,
		signal: options.signal,
		timeoutMs: options.timeoutMs,
	});

	const success = readRequiredBoolean(raw, "success", PROVIDER);
	const providerErrorCodes = readStringArray(raw, "error-codes");

	if (!success) {
		return finalizeProviderFailure(options, raw, providerErrorCodes, "verification-failed");
	}

	const hostname = readString(raw, "hostname");
	const score = readNumber(raw, "score");
	const action = readString(raw, "action");
	const mismatches = getCommonMismatchCodes<HCaptchaErrorCode>({
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
			challengeTs: readString(raw, "challenge_ts"),
			hostname,
			credit: readBoolean(raw, "credit"),
			score,
			scoreReason: readStringArray(raw, "score_reason"),
		},
		raw,
	});
}
