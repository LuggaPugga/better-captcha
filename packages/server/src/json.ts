import { CaptchaServerError } from "./errors";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
export type JsonObject = { [key: string]: JsonValue };

export function isJsonObject(value: unknown): value is JsonObject {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function readString(object: JsonObject, key: string): string | undefined {
	const value = object[key];
	return typeof value === "string" ? value : undefined;
}

export function readNumber(object: JsonObject, key: string): number | undefined {
	const value = object[key];
	return typeof value === "number" ? value : undefined;
}

export function readBoolean(object: JsonObject, key: string): boolean | undefined {
	const value = object[key];
	return typeof value === "boolean" ? value : undefined;
}

export function readRequiredBoolean(object: JsonObject, key: string, provider: string): boolean {
	const value = readBoolean(object, key);
	if (value === undefined) {
		throw new CaptchaServerError("invalid-response", "Provider response is missing a boolean success field.", {
			provider,
		});
	}
	return value;
}

export function readStringArray(object: JsonObject, key: string): string[] {
	const value = object[key];
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter((item): item is string => typeof item === "string");
}

export function readObject(object: JsonObject, key: string): JsonObject | undefined {
	const value = object[key];
	return isJsonObject(value) ? value : undefined;
}

export function readNestedString(object: JsonObject, key: string, nestedKey: string): string | undefined {
	const nested = readObject(object, key);
	if (!nested) {
		return undefined;
	}
	return readString(nested, nestedKey);
}
