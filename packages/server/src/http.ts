import { CaptchaServerError } from "./errors";
import { isJsonObject, type JsonObject } from "./json";

export type FetchLike = typeof fetch;

export interface HttpRequestOptions {
	fetcher?: FetchLike;
	signal?: AbortSignal;
	timeoutMs?: number;
}

interface PostJsonOptions extends HttpRequestOptions {
	url: string;
	body: URLSearchParams | JsonObject;
	provider: string;
	headers?: Record<string, string>;
}

function getFetch(fetcher?: FetchLike): FetchLike {
	if (fetcher) {
		return fetcher;
	}
	if (typeof globalThis.fetch === "function") {
		return globalThis.fetch.bind(globalThis);
	}
	throw new CaptchaServerError("invalid-runtime", "Global fetch is not available in this runtime.");
}

function mergeAbortSignal(
	signal: AbortSignal | undefined,
	timeoutMs: number | undefined,
): {
	signal?: AbortSignal;
	cleanup: () => void;
} {
	if (!signal && !timeoutMs) {
		return { cleanup: () => {} };
	}

	const controller = new AbortController();
	let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
	let detach: (() => void) | undefined;

	if (signal) {
		if (signal.aborted) {
			controller.abort(signal.reason);
		} else {
			const listener = () => controller.abort(signal.reason);
			signal.addEventListener("abort", listener, { once: true });
			detach = () => signal.removeEventListener("abort", listener);
		}
	}

	if (typeof timeoutMs === "number" && timeoutMs > 0) {
		timeoutHandle = setTimeout(() => {
			controller.abort(new Error("Captcha verification request timed out."));
		}, timeoutMs);
	}

	return {
		signal: controller.signal,
		cleanup: () => {
			if (timeoutHandle) {
				clearTimeout(timeoutHandle);
			}
			detach?.();
		},
	};
}

function ensureJsonObject(value: unknown, provider: string): JsonObject {
	if (!isJsonObject(value)) {
		throw new CaptchaServerError("invalid-response", "Provider returned a non-object JSON response.", {
			provider,
		});
	}
	return value;
}

async function parseJsonObject(response: Response, provider: string): Promise<JsonObject> {
	try {
		return ensureJsonObject(await response.json(), provider);
	} catch (error) {
		if (error instanceof CaptchaServerError) {
			throw error;
		}
		throw new CaptchaServerError("invalid-response", "Provider returned invalid JSON.", {
			provider,
			cause: error,
		});
	}
}

function createPostRequestInit(
	body: URLSearchParams | JsonObject,
	signal: AbortSignal | undefined,
	headers: Record<string, string> | undefined,
): RequestInit {
	const isFormBody = body instanceof URLSearchParams;
	const contentType = isFormBody ? "application/x-www-form-urlencoded" : "application/json";
	return {
		method: "POST",
		signal,
		headers: {
			"content-type": contentType,
			...(headers ?? {}),
		},
		body: isFormBody ? body : JSON.stringify(body),
	};
}

export async function postJson(options: PostJsonOptions): Promise<JsonObject> {
	const { url, body, provider, fetcher, signal, timeoutMs, headers } = options;
	const fetchImpl = getFetch(fetcher);
	const abort = mergeAbortSignal(signal, timeoutMs);
	const requestInit = createPostRequestInit(body, abort.signal, headers);

	try {
		const response = await fetchImpl(url, requestInit);

		if (!response.ok) {
			throw new CaptchaServerError("http-error", `Provider returned HTTP ${response.status}.`, {
				provider,
				status: response.status,
			});
		}

		return parseJsonObject(response, provider);
	} catch (error) {
		if (error instanceof CaptchaServerError) {
			throw error;
		}

		throw new CaptchaServerError("network-error", "Captcha verification request failed.", {
			provider,
			cause: error,
		});
	} finally {
		abort.cleanup();
	}
}
