import { postJson } from "../http";
import type { VerificationResult } from "../result";
import {
	asBoolean,
	assertNonEmptyString,
	type BaseVerifyOptions,
	finalizeVerification,
	getOptionalString,
	getStringArray,
	withFallbackErrorCodes,
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

	const body = new URLSearchParams({
		secret: options.secret,
		response: options.response,
	});
	if (options.remoteip) {
		body.set("remoteip", options.remoteip);
	}
	if (options.idempotencyKey) {
		body.set("idempotency_key", options.idempotencyKey);
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
			errorCodes: withFallbackErrorCodes<TurnstileErrorCode>(providerErrorCodes, "verification-failed"),
			raw,
		});
	}

	const action = getOptionalString(raw.action);
	const hostname = getOptionalString(raw.hostname);
	const cdata = getOptionalString(raw.cdata);
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

	const metadataValue = raw.metadata;
	const ephemeralId =
		metadataValue && typeof metadataValue === "object"
			? getOptionalString((metadataValue as Record<string, unknown>).ephemeral_id)
			: undefined;

	return finalizeVerification(options, {
		success: true,
		data: {
			challengeTs: getOptionalString(raw.challenge_ts),
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
