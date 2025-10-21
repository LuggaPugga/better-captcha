# @better-captcha/qwik

Qwik wrappers for CAPTCHA providers that share the same lifecycle, render flow, and control handle so you can swap vendors without touching your UI.

> [!WARNING]
> This library is in early development and is not production ready yet. Expect breaking API changes while the provider surface stabilises.

## Installation

```sh
bun install @better-captcha/qwik
```
```sh
npm install @better-captcha/qwik
```

## Basic usage

```tsx
import { component$ } from "@builder.io/qwik";
import { ReCaptcha } from "@better-captcha/qwik/provider/recaptcha";

export const ContactCaptcha = component$(() => {
	return <ReCaptcha sitekey="your-site-key" />;
});
```

Keep the component inside a client-only boundary, access the handle via events when needed, and forward the response token to your backend alongside the form submission.

## Key ideas

- Unified lifecycle that loads provider scripts on demand.
- Shared handle API (`execute`, `reset`, `destroy`, `getResponse`) across providers.
- Provider-specific bundles such as reCAPTCHA, hCaptcha, Turnstile, and Friendly Captcha.
