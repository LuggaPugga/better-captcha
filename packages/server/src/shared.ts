import { CaptchaServerError } from "./errors";
import type { JsonObject } from "./json";
import type { VerificationFailure, VerificationResult, VerificationSuccess } from "./result";

type MaybePromise<T> = T | Promise<T>;

export interface VerificationCallbacks<TData, TCode extends string> {
	onSuccess?: (result: VerificationSuccess<TData>) => MaybePromise<void>;
	onError?: (result: VerificationFailure<TCode>) => MaybePromise<void>;
}

export interface BaseVerifyOptions<TData = JsonObject, TCode extends string = string>
	extends VerificationCallbacks<TData, TCode> {
	response: string;
	timeoutMs?: number;
	signal?: AbortSignal;
	fetcher?: typeof fetch;
}

export function assertNonEmptyString(value: unknown, field: string, provider: string): asserts value is string {
	if (typeof value !== "string" || value.trim() === "") {
		throw new CaptchaServerError("invalid-argument", `${field} must be a non-empty string.`, {
			provider,
		});
	}
}

export function withFallbackErrorCodes<TCode extends string>(codes: string[], fallback: TCode): TCode[] {
	return (codes.length > 0 ? codes : [fallback]) as TCode[];
}

export function buildProviderFormBody(
	secret: string,
	response: string,
	entries: Record<string, string | undefined> = {},
): URLSearchParams {
	const body = new URLSearchParams({
		secret,
		response,
	});
	for (const [key, value] of Object.entries(entries)) {
		if (typeof value === "string") {
			body.set(key, value);
		}
	}
	return body;
}

export function getCommonMismatchCodes<TCode extends string>(options: {
	expectedHostname?: string;
	hostname?: string;
	hostnameMismatchCode: TCode;
	expectedAction?: string;
	action?: string;
	actionMismatchCode: TCode;
	minScore?: number;
	score?: number;
	scoreTooLowCode: TCode;
}): TCode[] {
	const mismatches: TCode[] = [];
	if (options.expectedHostname && options.hostname !== options.expectedHostname) {
		mismatches.push(options.hostnameMismatchCode);
	}
	if (options.expectedAction && options.action !== options.expectedAction) {
		mismatches.push(options.actionMismatchCode);
	}
	if (typeof options.minScore === "number" && typeof options.score === "number" && options.score < options.minScore) {
		mismatches.push(options.scoreTooLowCode);
	}
	return mismatches;
}

export function finalizeProviderFailure<TData, TCode extends string>(
	options: VerificationCallbacks<TData, TCode>,
	raw: JsonObject,
	providerErrorCodes: string[],
	fallback: TCode,
): Promise<VerificationResult<TData, TCode>> {
	return finalizeVerification(options, {
		success: false,
		errorCodes: withFallbackErrorCodes<TCode>(providerErrorCodes, fallback),
		raw,
	});
}

export async function finalizeVerification<TData, TCode extends string>(
	options: VerificationCallbacks<TData, TCode>,
	result: VerificationResult<TData, TCode>,
): Promise<VerificationResult<TData, TCode>> {
	if (result.success) {
		await options.onSuccess?.(result);
	} else {
		await options.onError?.(result);
	}
	return result;
}
