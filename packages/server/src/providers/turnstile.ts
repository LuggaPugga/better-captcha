import { postJson } from "../http";
import { readNestedString, readRequiredBoolean, readString, readStringArray } from "../json";
import type { VerificationResult } from "../result";
import {
	assertNonEmptyString,
	type BaseVerifyOptions,
	buildProviderFormBody,
	finalizeProviderFailure,
	finalizeVerification,
} from "../shared";

const PROVIDER = "turnstile";
const DEFAULT_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileErrorCode =
	| "missing-input-secret"
	| "invalid-input-secret"
	| "missing-input-response"
	| "invalid-input-response"
	| "bad-request"
	| "timeout-or-duplicate"
	| "internal-error"
	| "action-mismatch"
	| "hostname-mismatch"
	| "cdata-mismatch"
	| "verification-failed";

export interface TurnstileSuccessData {
	challengeTs?: string;
	hostname?: string;
	action?: string;
	cdata?: string;
	metadata: {
		ephemeralId?: string;
	};
}

export type TurnstileVerificationResult = VerificationResult<TurnstileSuccessData, TurnstileErrorCode>;

export interface TurnstileVerifyOptions extends BaseVerifyOptions<TurnstileSuccessData, TurnstileErrorCode> {
	secret: string;
	remoteip?: string;
	idempotencyKey?: string;
	expectedAction?: string;
	expectedHostname?: string;
	expectedCData?: string;
	endpoint?: string;
}

export async function verifyTurnstile(options: TurnstileVerifyOptions): Promise<TurnstileVerificationResult> {
	assertNonEmptyString(options.secret, "secret", PROVIDER);
	assertNonEmptyString(options.response, "response", PROVIDER);

	const body = buildProviderFormBody(options.secret, options.response, {
		remoteip: options.remoteip,
		idempotency_key: options.idempotencyKey,
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

	const action = readString(raw, "action");
	const hostname = readString(raw, "hostname");
	const cdata = readString(raw, "cdata");
	const mismatches: TurnstileErrorCode[] = [];

	if (options.expectedAction && action !== options.expectedAction) {
		mismatches.push("action-mismatch");
	}
	if (options.expectedHostname && hostname !== options.expectedHostname) {
		mismatches.push("hostname-mismatch");
	}
	if (options.expectedCData && cdata !== options.expectedCData) {
		mismatches.push("cdata-mismatch");
	}

	if (mismatches.length > 0) {
		return finalizeVerification(options, {
			success: false,
			errorCodes: mismatches,
			raw,
		});
	}

	const ephemeralId = readNestedString(raw, "metadata", "ephemeral_id");

	return finalizeVerification(options, {
		success: true,
		data: {
			challengeTs: readString(raw, "challenge_ts"),
			hostname,
			action,
			cdata,
			metadata: {
				ephemeralId,
			},
		},
		raw,
	});
}
