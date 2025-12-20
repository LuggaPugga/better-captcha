# @better-captcha/react

React wrappers for CAPTCHA providers that share the same lifecycle, render flow, and control handle so you can swap vendors without touching your UI.

## Installation

```sh
bun install @better-captcha/react
```
```sh
npm install @better-captcha/react
```

## Basic usage

```tsx
import { ReCaptcha } from "@better-captcha/react/provider/recaptcha";

export function ContactCaptcha() {
	return <ReCaptcha sitekey="your-site-key" />;
}
```

Keep the component inside a client-only boundary, access the ref to call `execute`, and forward the response token to your backend alongside the form submission.

## Key ideas

- Unified hook-driven lifecycle that loads provider scripts on demand.
- Shared handle API (`execute`, `reset`, `destroy`, `getResponse`) across providers.
- Provider-specific bundles such as reCAPTCHA, hCaptcha, Turnstile, and Friendly Captcha.
