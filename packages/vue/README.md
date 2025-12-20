# @better-captcha/vue

Vue 3 wrappers for CAPTCHA providers that share the same lifecycle, render flow, and control handle so you can swap vendors without touching your UI.

## Installation

```sh
bun install @better-captcha/vue
```
```sh
npm install @better-captcha/vue
```

## Basic usage

```vue
<script setup lang="ts">
import { ReCaptcha } from "@better-captcha/vue/provider/recaptcha";
import { ref } from "vue";

const captchaRef = ref();

const onReady = (handle) => {
  console.log("Captcha is ready", handle);
};

const onError = (error) => {
  console.error("Captcha error:", error);
};
</script>

<template>
  <ReCaptcha
    ref="captchaRef"
    sitekey="your-site-key"
    :options="{ theme: 'light' }"
    @ready="onReady"
    @error="onError"
  />
</template>
```

Keep the component inside a client-only boundary, access the ref to call `execute`, and forward the response token to your backend alongside the form submission.

## Key ideas

- Unified hook-driven lifecycle that loads provider scripts on demand.
- Shared handle API (`execute`, `reset`, `destroy`, `getResponse`) across providers.
- Provider-specific bundles such as reCAPTCHA, hCaptcha, Turnstile, and Friendly Captcha.
