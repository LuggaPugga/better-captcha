# react-captcha

React-friendly wrappers for CAPTCHA providers that share the same lifecycle, render flow, and control handle so you can swap vendors without touching your UI.

> [!WARNING]
> This library is in early development and is not production ready yet. Expect breaking API changes while the provider surface stabilises.

## Installation

Install the package and peer dependencies that match your project setup:

```sh
coming soon
```

## Basic usage

```tsx
import { ReCaptcha } from "react-captcha/provider/recaptcha";

export function ContactCaptcha() {
	return <ReCaptcha sitekey="your-site-key" />;
}
```

Keep the component inside a client-only boundary, access the ref to call `execute`, and forward the response token to your backend alongside the form submission.

## Key ideas

- Unified hook-driven lifecycle that loads provider scripts on demand.
- Shared handle API (`execute`, `reset`, `destroy`, `getResponse`) across providers.
- Provider-specific bundles such as reCAPTCHA, hCaptcha, Turnstile, and Friendly Captcha.
