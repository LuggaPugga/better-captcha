import { CaptchaServerError } from "./errors";

export type FetchLike = typeof fetch;

export interface HttpRequestOptions {
	fetcher?: FetchLike;
	signal?: AbortSignal;
	timeoutMs?: number;
}

interface JsonRequestOptions extends HttpRequestOptions {
	url: string;
	body: URLSearchParams | Record<string, unknown>;
	provider: string;
	jsonBody?: boolean;
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

function asObject(value: unknown, provider: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new CaptchaServerError("invalid-response", "Provider returned a non-object JSON response.", {
			provider,
		});
	}
	return value as Record<string, unknown>;
}

export async function postJson(options: JsonRequestOptions): Promise<Record<string, unknown>> {
	const { url, body, provider, fetcher, signal, timeoutMs, jsonBody, headers } = options;
	const fetchImpl = getFetch(fetcher);
	const abort = mergeAbortSignal(signal, timeoutMs);

	const requestInit: RequestInit = {
		method: "POST",
		signal: abort.signal,
	};

	if (jsonBody) {
		requestInit.headers = { "content-type": "application/json", ...(headers ?? {}) };
		requestInit.body = JSON.stringify(body);
	} else {
		requestInit.headers = { "content-type": "application/x-www-form-urlencoded", ...(headers ?? {}) };
		requestInit.body =
			body instanceof URLSearchParams
				? body.toString()
				: new URLSearchParams(
						Object.entries(body).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
					).toString();
	}

	try {
		const response = await fetchImpl(url, requestInit);

		if (!response.ok) {
			throw new CaptchaServerError("http-error", `Provider returned HTTP ${response.status}.`, {
				provider,
				status: response.status,
			});
		}

		const data = await response.json();
		return asObject(data, provider);
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
