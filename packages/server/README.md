# @better-captcha/server

Server-side CAPTCHA token verification with modular provider adapters and typed error handling.

> [!WARNING]
> This library is in early development and is not production ready yet. Expect breaking API changes while the provider surface stabilises.

## Installation

```sh
bun install @better-captcha/server
```
```sh
npm install @better-captcha/server
```

## Quick Start

```ts
import { verifyToken } from "@better-captcha/server";

const result = await verifyToken("turnstile", {
	secret: process.env.TURNSTILE_SECRET_KEY!,
	response: tokenFromClient,
	expectedHostname: "example.com",
});

if (!result.success) {
	console.error(result.errorCodes);
}
```

## Verification Callbacks

Every verifier accepts optional `onSuccess` and `onError` callbacks:

```ts
import { verifyTurnstile } from "@better-captcha/server";

await verifyTurnstile({
	secret: process.env.TURNSTILE_SECRET_KEY!,
	response: tokenFromClient,
	onSuccess: (result) => {
		console.log("captcha ok", result.data.hostname);
	},
	onError: (result) => {
		console.warn("captcha failed", result.errorCodes);
	},
});
```

## Provider APIs

- `turnstile` via Cloudflare Siteverify
- `recaptcha` and `recaptcha-v3` via Google Siteverify
- `hcaptcha` via hCaptcha Siteverify
- `friendly-captcha` via Friendly Captcha Siteverify
- `recaptcha-compatible` for any provider exposing a compatible `siteverify` endpoint
- `captcha-fox`, `private-captcha`, `prosopo` via their recaptcha-compatible backend endpoints

## Provider Examples

### Turnstile

```ts
import { verifyTurnstile } from "@better-captcha/server";

const result = await verifyTurnstile({
	secret: process.env.TURNSTILE_SECRET_KEY!,
	response: tokenFromClient,
	expectedHostname: "example.com",
	expectedAction: "signup",
	expectedCData: "flow-signup",
});
```

### reCAPTCHA / reCAPTCHA v3

```ts
import { verifyReCaptcha } from "@better-captcha/server";

const result = await verifyReCaptcha({
	secret: process.env.RECAPTCHA_SECRET_KEY!,
	response: tokenFromClient,
	expectedHostname: "example.com",
	expectedAction: "signup",
	minScore: 0.5,
});
```

### hCaptcha

```ts
import { verifyHCaptcha } from "@better-captcha/server";

const result = await verifyHCaptcha({
	secret: process.env.HCAPTCHA_SECRET_KEY!,
	response: tokenFromClient,
	sitekey: process.env.HCAPTCHA_SITE_KEY,
	expectedHostname: "example.com",
	minScore: 0.5,
});
```

### Friendly Captcha

```ts
import { verifyFriendlyCaptcha } from "@better-captcha/server";

const result = await verifyFriendlyCaptcha({
	apiKey: process.env.FRIENDLY_CAPTCHA_API_KEY!,
	response: tokenFromClient,
	sitekey: process.env.FRIENDLY_CAPTCHA_SITE_KEY,
});
```

### ReCaptcha-Compatible Providers

```ts
import { verifyReCaptchaCompatible } from "@better-captcha/server";

const result = await verifyReCaptchaCompatible({
	endpoint: "https://provider.example.com/siteverify",
	secret: process.env.CAPTCHA_SECRET!,
	response: tokenFromClient,
	sitekey: process.env.CAPTCHA_SITE_KEY,
});
```

### CaptchaFox

```ts
import { verifyCaptchaFox } from "@better-captcha/server";

const result = await verifyCaptchaFox({
	endpoint: "https://api.captchafox.com/siteverify",
	secret: process.env.CAPTCHAFOX_SECRET!,
	response: tokenFromClient,
});
```

### Private Captcha

```ts
import { verifyPrivateCaptcha } from "@better-captcha/server";

const result = await verifyPrivateCaptcha({
	endpoint: "https://verify.privatecaptcha.com/siteverify",
	secret: process.env.PRIVATE_CAPTCHA_SECRET!,
	response: tokenFromClient,
});
```

### Prosopo

```ts
import { verifyProsopo } from "@better-captcha/server";

const result = await verifyProsopo({
	endpoint: "https://verify.prosopo.io/siteverify",
	secret: process.env.PROSOPO_SECRET!,
	response: tokenFromClient,
});
```

## Error Handling

- Verification failures return `{ success: false, errorCodes }` (no throw)
- Transport/runtime issues throw `CaptchaServerError`
- Use `isCaptchaServerError(error)` to narrow in catch blocks

```ts
import { isCaptchaServerError, verifyReCaptcha } from "@better-captcha/server";

try {
	const result = await verifyReCaptcha({
		secret: process.env.RECAPTCHA_SECRET!,
		response: tokenFromClient,
	});
} catch (error) {
	if (isCaptchaServerError(error)) {
		console.error(error.code, error.status, error.provider);
	}
}
```
