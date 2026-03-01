import { CaptchaServerError } from "./errors";
import type { JsonObject } from "./json";

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
	const timeout = timeoutMs && timeoutMs > 0 ? timeoutMs : undefined;

	if (!signal && !timeout) {
		return { cleanup: () => {} };
	}

	const controller = new AbortController();
	const cleanupTasks: Array<() => void> = [];

	if (signal) {
		if (signal.aborted) {
			controller.abort(signal.reason);
		} else {
			const listener = () => controller.abort(signal.reason);
			signal.addEventListener("abort", listener, { once: true });
			cleanupTasks.push(() => signal.removeEventListener("abort", listener));
		}
	}

	if (timeout) {
		const timeoutHandle = setTimeout(() => {
			controller.abort(new Error("Captcha verification request timed out."));
		}, timeout);
		cleanupTasks.push(() => clearTimeout(timeoutHandle));
	}

	return {
		signal: controller.signal,
		cleanup: () => {
			for (const task of cleanupTasks) {
				task();
			}
		},
	};
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

		return (await response.json()) as JsonObject;
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
