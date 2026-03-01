import { CaptchaServerError } from "./errors";
import type { VerificationFailure, VerificationResult, VerificationSuccess } from "./result";

type MaybePromise<T> = T | Promise<T>;

export interface VerificationCallbacks<TData, TCode extends string> {
	onSuccess?: (result: VerificationSuccess<TData>) => MaybePromise<void>;
	onError?: (result: VerificationFailure<TCode>) => MaybePromise<void>;
}

export interface BaseVerifyOptions<TData = unknown, TCode extends string = string>
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

export function getStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter((item): item is string => typeof item === "string");
}

export function withFallbackErrorCodes<TCode extends string>(codes: string[], fallback: TCode): TCode[] {
	return (codes.length > 0 ? codes : [fallback]) as TCode[];
}

export function getOptionalString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

export function getOptionalNumber(value: unknown): number | undefined {
	return typeof value === "number" ? value : undefined;
}

export function asBoolean(value: unknown, provider: string): boolean {
	if (typeof value !== "boolean") {
		throw new CaptchaServerError("invalid-response", "Provider response is missing a boolean success field.", {
			provider,
		});
	}
	return value;
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
