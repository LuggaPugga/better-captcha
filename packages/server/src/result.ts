export interface VerificationSuccess<TData> {
	success: true;
	data: TData;
	raw: unknown;
}

export interface VerificationFailure<TCode extends string = string> {
	success: false;
	errorCodes: readonly TCode[];
	raw: unknown;
}

export type VerificationResult<TData, TCode extends string = string> =
	| VerificationSuccess<TData>
	| VerificationFailure<TCode>;
