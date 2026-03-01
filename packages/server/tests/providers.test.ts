import { describe, expect, it, vi } from "vitest";
import {
	CaptchaServerError,
	verifyCaptchaFox,
	verifyFriendlyCaptcha,
	verifyHCaptcha,
	verifyPrivateCaptcha,
	verifyProsopo,
	verifyReCaptcha,
	verifyToken,
	verifyTurnstile,
} from "../src";

const TOKENS = {
	turnstile: "XXXX.DUMMY.TOKEN.XXXX",
	hcaptchaPass: "10000000-aaaa-bbbb-cccc-000000000001",
	friendlyCaptcha: "frc_foobar",
	privateCaptcha: "AQI-test-private-captcha-solution",
} as const;

const KEYS = {
	turnstileSecret: "1x0000000000000000000000000000000AA",
	recaptchaSitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
	recaptchaSecret: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe",
	hcaptchaSecret: "0x0000000000000000000000000000000000000000",
} as const;

function createJsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json",
		},
	});
}

function createFetcher(body: unknown, status = 200) {
	return vi.fn(async () => createJsonResponse(body, status));
}

function getRequest(fetcher: ReturnType<typeof vi.fn>, call = 0): { url: string; init: RequestInit } {
	const url = fetcher.mock.calls[call]?.[0] as string;
	const init = (fetcher.mock.calls[call]?.[1] ?? {}) as RequestInit;
	return { url, init };
}

function getBody(fetcher: ReturnType<typeof vi.fn>, call = 0): string {
	return String(getRequest(fetcher, call).init.body);
}

describe("turnstile", () => {
	it("validates success and sends provider-specific fields", async () => {
		const fetcher = createFetcher({
			success: true,
			challenge_ts: "2026-02-26T12:00:00.000Z",
			hostname: "example.com",
			action: "signup",
			cdata: "abc",
		});

		const result = await verifyTurnstile({
			secret: KEYS.turnstileSecret,
			response: TOKENS.turnstile,
			remoteip: "203.0.113.10",
			idempotencyKey: "req-123",
			expectedHostname: "example.com",
			expectedAction: "signup",
			fetcher,
		});

		expect(result.success).toBe(true);
		expect(getRequest(fetcher).url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");

		const body = getBody(fetcher);
		expect(body).toContain(`secret=${encodeURIComponent(KEYS.turnstileSecret)}`);
		expect(body).toContain(`response=${encodeURIComponent(TOKENS.turnstile)}`);
		expect(body).toContain("remoteip=203.0.113.10");
		expect(body).toContain("idempotency_key=req-123");
	});

	it("returns mismatch errors when expected metadata does not match", async () => {
		const fetcher = createFetcher({
			success: true,
			hostname: "wrong.example.com",
			action: "other",
		});

		const result = await verifyTurnstile({
			secret: KEYS.turnstileSecret,
			response: TOKENS.turnstile,
			expectedHostname: "example.com",
			expectedAction: "signup",
			fetcher,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toEqual(expect.arrayContaining(["hostname-mismatch", "action-mismatch"]));
		}
	});
});

describe("recaptcha", () => {
	it("validates v3-style action and score checks", async () => {
		const fetcher = createFetcher({
			success: true,
			hostname: "example.com",
			action: "submit",
			score: 0.9,
		});

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			expectedHostname: "example.com",
			expectedAction: "submit",
			minScore: 0.5,
			fetcher,
		});

		expect(result.success).toBe(true);
		expect(getRequest(fetcher).url).toBe("https://www.google.com/recaptcha/api/siteverify");
	});

	it("returns provider error codes on failed verification", async () => {
		const fetcher = createFetcher({
			success: false,
			"error-codes": ["timeout-or-duplicate"],
		});

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			fetcher,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toEqual(["timeout-or-duplicate"]);
		}
	});

	it("returns semantic mismatch codes for action and score", async () => {
		const fetcher = createFetcher({
			success: true,
			hostname: "example.com",
			action: "login",
			score: 0.2,
		});

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			expectedAction: "signup",
			minScore: 0.8,
			fetcher,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toEqual(expect.arrayContaining(["action-mismatch", "score-too-low"]));
		}
	});
});

describe("hcaptcha", () => {
	it("sends sitekey and maps score constraints", async () => {
		const fetcher = createFetcher({
			success: true,
			score: 0.2,
			hostname: "example.com",
		});

		const result = await verifyHCaptcha({
			secret: KEYS.hcaptchaSecret,
			response: TOKENS.hcaptchaPass,
			sitekey: KEYS.recaptchaSitekey,
			minScore: 0.5,
			fetcher,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toContain("score-too-low");
		}

		expect(getRequest(fetcher).url).toBe("https://api.hcaptcha.com/siteverify");
		const body = getBody(fetcher);
		expect(body).toContain(`response=${encodeURIComponent(TOKENS.hcaptchaPass)}`);
		expect(body).toContain(`secret=${encodeURIComponent(KEYS.hcaptchaSecret)}`);
		expect(body).toContain(`sitekey=${encodeURIComponent(KEYS.recaptchaSitekey)}`);
	});
});

describe("friendly-captcha", () => {
	it("sends x-api-key and maps error codes", async () => {
		const fetcher = createFetcher({
			success: false,
			error: {
				error_code: "response_invalid",
			},
		});

		const result = await verifyFriendlyCaptcha({
			apiKey: "FCAT_myapikey",
			response: TOKENS.friendlyCaptcha,
			fetcher,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.errorCodes).toEqual(["response_invalid"]);
		}

		expect(getRequest(fetcher).url).toBe("https://global.frcapi.com/api/v2/captcha/siteverify");
		const headers = getRequest(fetcher).init.headers as Record<string, string>;
		expect(headers["x-api-key"]).toBe("FCAT_myapikey");
	});
});

describe("recaptcha-compatible wrappers", () => {
	it("supports captcha-fox, private-captcha, and prosopo", async () => {
		const fetcher = createFetcher({ success: true, hostname: "example.com" });
		const options = {
			endpoint: "https://example.com/siteverify",
			secret: KEYS.recaptchaSecret,
			response: TOKENS.privateCaptcha,
			fetcher,
		};

		const fox = await verifyCaptchaFox(options);
		const privateCaptcha = await verifyPrivateCaptcha(options);
		const prosopo = await verifyProsopo(options);

		expect(fox.success).toBe(true);
		expect(privateCaptcha.success).toBe(true);
		expect(prosopo.success).toBe(true);
		expect(fetcher).toHaveBeenCalledTimes(3);
	});
});

describe("verifyToken", () => {
	it("dispatches captcha-fox", async () => {
		const fetcher = createFetcher({ success: true, hostname: "example.com" });

		const result = await verifyToken("captcha-fox", {
			endpoint: "https://example.com/siteverify",
			secret: KEYS.recaptchaSecret,
			response: TOKENS.privateCaptcha,
			fetcher,
		});

		expect(result.success).toBe(true);
	});

	it("dispatches recaptcha-v3 alias", async () => {
		const fetcher = createFetcher({
			success: true,
			hostname: "example.com",
			action: "submit",
			score: 0.9,
		});

		const result = await verifyToken("recaptcha-v3", {
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			expectedAction: "submit",
			minScore: 0.5,
			fetcher,
		});

		expect(result.success).toBe(true);
	});
});

describe("result callbacks", () => {
	it("calls onSuccess when verification succeeds", async () => {
		const fetcher = createFetcher({
			success: true,
			hostname: "example.com",
			action: "submit",
			score: 0.9,
		});
		const onSuccess = vi.fn();
		const onError = vi.fn();

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			fetcher,
			onSuccess,
			onError,
		});

		expect(result.success).toBe(true);
		expect(onSuccess).toHaveBeenCalledTimes(1);
		expect(onSuccess).toHaveBeenCalledWith(result);
		expect(onError).not.toHaveBeenCalled();
	});

	it("calls onError when verification fails", async () => {
		const fetcher = createFetcher({
			success: false,
			"error-codes": ["timeout-or-duplicate"],
		});
		const onSuccess = vi.fn();
		const onError = vi.fn();

		const result = await verifyReCaptcha({
			secret: KEYS.recaptchaSecret,
			response: TOKENS.turnstile,
			fetcher,
			onSuccess,
			onError,
		});

		expect(result.success).toBe(false);
		expect(onError).toHaveBeenCalledTimes(1);
		expect(onError).toHaveBeenCalledWith(result);
		expect(onSuccess).not.toHaveBeenCalled();
	});
});

describe("error handling", () => {
	it("throws CaptchaServerError for non-2xx responses", async () => {
		const fetcher = createFetcher({ message: "bad request" }, 400);

		await expect(
			verifyTurnstile({
				secret: KEYS.turnstileSecret,
				response: TOKENS.turnstile,
				fetcher,
			}),
		).rejects.toBeInstanceOf(CaptchaServerError);
	});
});
