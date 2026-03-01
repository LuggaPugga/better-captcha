import { CaptchaServerError } from "./errors";

export type FetchLike = typeof fetch;

export interface HttpRequestOptions {
	fetcher?: FetchLike;
	signal?: AbortSignal;
	timeoutMs?: number;
}

interface PostJsonOptions extends HttpRequestOptions {
	url: string;
	body: URLSearchParams | Record<string, unknown>;
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

function asObject(value: unknown, provider: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new CaptchaServerError("invalid-response", "Provider returned a non-object JSON response.", {
			provider,
		});
	}
	return value as Record<string, unknown>;
}

function createPostRequestInit(
	body: URLSearchParams | Record<string, unknown>,
	signal: AbortSignal | undefined,
	headers: Record<string, string> | undefined,
): RequestInit {
	const isFormBody = body instanceof URLSearchParams;
	const serializedBody = isFormBody ? body.toString() : JSON.stringify(body);
	const contentType = isFormBody ? "application/x-www-form-urlencoded" : "application/json";
	return {
		method: "POST",
		signal,
		headers: {
			"content-type": contentType,
			...(headers ?? {}),
		},
		body: serializedBody,
	};
}

export async function postJson(options: PostJsonOptions): Promise<Record<string, unknown>> {
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
