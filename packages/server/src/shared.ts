import { CaptchaServerError } from "./errors";
import type { JsonObject } from "./json";
import type { VerificationFailure, VerificationResult, VerificationSuccess } from "./result";

type MaybePromise<T> = T | Promise<T>;

export interface VerificationCallbacks<TData, TCode extends string> {
	onSuccess?: (result: VerificationSuccess<TData>) => MaybePromise<void>;
	onError?: (result: VerificationFailure<TCode>) => MaybePromise<void>;
	onCallbackError?: (error: unknown) => MaybePromise<void>;
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

export function assertOptionalNonEmptyString(value: string | undefined, field: string, provider: string): void {
	if (value !== undefined) {
		assertNonEmptyString(value, field, provider);
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
		if (value !== undefined) {
			body.set(key, value);
		}
	}
	return body;
}

export function omitSiteverifyExtra(
	extra: Record<string, string | undefined> | undefined,
): Record<string, string | undefined> {
	if (!extra) {
		return {};
	}
	const copy = { ...extra };
	delete copy.secret;
	delete copy.response;
	delete copy.remoteip;
	delete copy.sitekey;
	return copy;
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
	const mismatches = getStringMismatchCodes<TCode>([
		{
			expected: options.expectedHostname,
			actual: options.hostname,
			mismatchCode: options.hostnameMismatchCode,
		},
		{
			expected: options.expectedAction,
			actual: options.action,
			mismatchCode: options.actionMismatchCode,
		},
	]);
	if (typeof options.minScore === "number" && (typeof options.score !== "number" || options.score < options.minScore)) {
		mismatches.push(options.scoreTooLowCode);
	}
	return mismatches;
}

export function getStringMismatchCodes<TCode extends string>(
	checks: ReadonlyArray<{
		expected?: string;
		actual?: string;
		mismatchCode: TCode;
	}>,
): TCode[] {
	return checks
		.filter((check) => check.expected !== undefined && check.actual !== check.expected)
		.map((check) => check.mismatchCode);
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

async function invokeCallback<T>(
	callback: ((result: T) => MaybePromise<void>) | undefined,
	result: T,
	onCallbackError?: (error: unknown) => MaybePromise<void>,
): Promise<void> {
	if (!callback) {
		return;
	}

	try {
		await callback(result);
	} catch (error) {
		try {
			await onCallbackError?.(error);
		} catch {}
	}
}

export async function finalizeVerification<TData, TCode extends string>(
	options: VerificationCallbacks<TData, TCode>,
	result: VerificationResult<TData, TCode>,
): Promise<VerificationResult<TData, TCode>> {
	if (result.success) {
		await invokeCallback(options.onSuccess, result, options.onCallbackError);
	} else {
		await invokeCallback(options.onError, result, options.onCallbackError);
	}

	return result;
}
