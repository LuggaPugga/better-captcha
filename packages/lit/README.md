# @better-captcha/lit

Lit web components for CAPTCHA providers that share the same lifecycle, render flow, and control handle so you can swap vendors without touching your UI.

> [!WARNING]
> This library is in early development and is not production ready yet. Expect breaking API changes while the provider surface stabilises.

## Installation

```sh
bun install @better-captcha/lit
```
```sh
npm install @better-captcha/lit
```

## Basic usage

```ts
import { ReCaptcha } from "@better-captcha/lit/provider/recaptcha";

// The component is automatically registered as a custom element named "recaptcha-captcha"
const captcha = document.querySelector('recaptcha-captcha');
const handle = captcha.getHandle();
```

```html
<recaptcha-captcha sitekey="your-site-key"></recaptcha-captcha>
```

Each provider has its own element name:
- Turnstile: `<turnstile-captcha>`
- hCaptcha: `<hcaptcha-captcha>`
- reCAPTCHA: `<recaptcha-captcha>`
- Friendly Captcha: `<friendly-captcha>`
- Private Captcha: `<private-captcha>`
- Captcha Fox: `<captcha-fox-captcha>`
- Prosopo: `<prosopo-captcha>`

Access the handle to call `execute`, and forward the response token to your backend alongside the form submission.

## Key ideas

- Unified lifecycle that loads provider scripts on demand.
- Shared handle API (`execute`, `reset`, `destroy`, `getResponse`) across providers.
- Provider-specific bundles such as reCAPTCHA, hCaptcha, Turnstile, and Friendly Captcha.
- Built with Lit for modern, standards-based web components.
