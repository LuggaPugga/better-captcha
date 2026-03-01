import { postJson } from "../http";
import type { VerificationResult } from "../result";
import {
	asBoolean,
	assertNonEmptyString,
	type BaseVerifyOptions,
	finalizeVerification,
	getOptionalNumber,
	getOptionalString,
	getStringArray,
	withFallbackErrorCodes,
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

	const body = new URLSearchParams({
		secret: options.secret,
		response: options.response,
	});

	if (options.remoteip) {
		body.set("remoteip", options.remoteip);
	}
	if (options.sitekey) {
		body.set("sitekey", options.sitekey);
	}

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
		return finalizeVerification(options, {
			success: false,
			errorCodes: withFallbackErrorCodes<HCaptchaErrorCode>(providerErrorCodes, "verification-failed"),
			raw,
		});
	}

	const hostname = getOptionalString(raw.hostname);
	const score = getOptionalNumber(raw.score);
	const action = getOptionalString(raw.action);
	const mismatches: HCaptchaErrorCode[] = [];

	if (options.expectedHostname && hostname !== options.expectedHostname) {
		mismatches.push("hostname-mismatch");
	}
	if (options.expectedAction && action !== options.expectedAction) {
		mismatches.push("action-mismatch");
	}
	if (typeof options.minScore === "number" && typeof score === "number" && score < options.minScore) {
		mismatches.push("score-too-low");
	}

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
			credit: typeof raw.credit === "boolean" ? raw.credit : undefined,
			score,
			scoreReason: getStringArray(raw.score_reason),
		},
		raw,
	});
}
