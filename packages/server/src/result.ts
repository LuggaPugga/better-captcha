import type { JsonObject } from "./json";

export interface VerificationSuccess<TData> {
	success: true;
	data: TData;
	raw: JsonObject;
}

export interface VerificationFailure<TCode extends string = string> {
	success: false;
	errorCodes: readonly TCode[];
	raw: JsonObject;
}

export type VerificationResult<TData, TCode extends string = string> =
	| VerificationSuccess<TData>
	| VerificationFailure<TCode>;
