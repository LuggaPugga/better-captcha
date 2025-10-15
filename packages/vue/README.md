# @better-captcha/vue

Modern Vue 3 components for CAPTCHA providers with a unified API. Switch between providers without changing your code structure.

## Features

- 🎯 **Unified API** - Same interface for all CAPTCHA providers
- 🔄 **Easy Provider Switching** - Change providers with minimal code changes
- 📦 **Tree-shakeable** - Only bundle the providers you use
- 🎨 **TypeScript First** - Full type safety and IntelliSense
- ⚡ **Vue 3 Composition API** - Modern reactive patterns
- 🪝 **Composables** - Use `useCaptcha()` for advanced control
- 🎭 **Template Refs** - Direct access to CAPTCHA handles

## Supported Providers

- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
- [hCaptcha](https://www.hcaptcha.com/)
- [Google reCAPTCHA](https://www.google.com/recaptcha/)
- [Friendly Captcha](https://friendlycaptcha.com/)
- [Private Captcha](https://privatecaptcha.com/)
- [Captcha Fox](https://captchafox.com/)
- [Prosopo](https://prosopo.io/)

## Installation

```bash
npm install @better-captcha/vue
# or
yarn add @better-captcha/vue
# or
pnpm add @better-captcha/vue
# or
bun add @better-captcha/vue
```

## Quick Start

### Basic Usage

```vue
<template>
  <div>
    <Turnstile
      ref="captchaRef"
      sitekey="your-site-key"
      :options="{ theme: 'light' }"
      @ready="onReady"
      @error="onError"
    />
    <button @click="handleSubmit">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Turnstile, type TurnstileHandle } from '@better-captcha/vue/provider/turnstile';

const captchaRef = ref<TurnstileHandle | null>(null);

const onReady = (handle: TurnstileHandle) => {
  console.log('CAPTCHA ready!', handle);
};

const onError = (error: Error) => {
  console.error('CAPTCHA error:', error);
};

const handleSubmit = async () => {
  const token = captchaRef.value?.getResponse();
  if (!token) {
    alert('Please complete the CAPTCHA');
    return;
  }
  
  // Submit your form with the token
  await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify({ captchaToken: token }),
  });
};
</script>
```

### Using the Composable

```vue
<template>
  <div>
    <Turnstile
      ref="captchaRef"
      sitekey="your-site-key"
      @ready="state.ready = true"
    />
    <button @click="execute" :disabled="!state.ready">
      Verify
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCaptcha } from '@better-captcha/vue';
import { Turnstile } from '@better-captcha/vue/provider/turnstile';

const { captchaRef, state, execute, reset, getResponse } = useCaptcha();
</script>
```

## Provider Examples

### Turnstile (Cloudflare)

```vue
<template>
  <Turnstile
    ref="captchaRef"
    sitekey="1x00000000000000000000AA"
    :options="{ theme: 'dark', size: 'compact' }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Turnstile, type TurnstileHandle } from '@better-captcha/vue/provider/turnstile';

const captchaRef = ref<TurnstileHandle | null>(null);
</script>
```

### hCaptcha

```vue
<template>
  <HCaptcha
    ref="captchaRef"
    sitekey="10000000-ffff-ffff-ffff-000000000001"
    :options="{ theme: 'dark', size: 'compact' }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { HCaptcha, type HCaptchaHandle } from '@better-captcha/vue/provider/hcaptcha';

const captchaRef = ref<HCaptchaHandle | null>(null);
</script>
```

### reCAPTCHA (Google)

```vue
<template>
  <ReCaptcha
    ref="captchaRef"
    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    :options="{ theme: 'dark', size: 'compact' }"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ReCaptcha, type ReCaptchaHandle } from '@better-captcha/vue/provider/recaptcha';

const captchaRef = ref<ReCaptchaHandle | null>(null);
</script>
```

## API Reference

### Component Props

All CAPTCHA components accept these props:

- `sitekey` (required): Your site key from the provider
- `options`: Provider-specific options (theme, size, etc.)
- `class`: CSS class name
- `style`: Inline styles

### Component Events

- `@ready`: Emitted when the CAPTCHA is ready (receives handle)
- `@error`: Emitted when an error occurs (receives Error object)

### Handle Methods

All providers expose these methods via template ref:

```typescript
interface CaptchaHandle {
  execute(): Promise<void>;      // Trigger the challenge
  reset(): void;                  // Reset the widget
  destroy(): void;                // Destroy and cleanup
  getResponse(): string;          // Get the response token
  getComponentState(): CaptchaState; // Get current state
}
```

### Composable API

```typescript
const {
  captchaRef,    // Ref to pass to component
  state,         // Reactive state (loading, error, ready)
  execute,       // Execute the challenge
  reset,         // Reset the widget
  destroy,       // Destroy the widget
  getResponse,   // Get the response token
} = useCaptcha<THandle>();
```

## Advanced Usage

### Dynamic Provider Switching

```vue
<template>
  <div>
    <select v-model="provider">
      <option value="turnstile">Turnstile</option>
      <option value="hcaptcha">hCaptcha</option>
      <option value="recaptcha">reCAPTCHA</option>
    </select>
    
    <component
      :is="currentComponent"
      ref="captchaRef"
      :sitekey="sitekeys[provider]"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Turnstile } from '@better-captcha/vue/provider/turnstile';
import { HCaptcha } from '@better-captcha/vue/provider/hcaptcha';
import { ReCaptcha } from '@better-captcha/vue/provider/recaptcha';

const provider = ref('turnstile');
const captchaRef = ref(null);

const components = {
  turnstile: Turnstile,
  hcaptcha: HCaptcha,
  recaptcha: ReCaptcha,
};

const sitekeys = {
  turnstile: '1x00000000000000000000AA',
  hcaptcha: '10000000-ffff-ffff-ffff-000000000001',
  recaptcha: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
};

const currentComponent = computed(() => components[provider.value]);
</script>
```

### Form Integration

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" required />
    
    <Turnstile
      ref="captchaRef"
      sitekey="your-site-key"
      @ready="captchaReady = true"
      @error="captchaError = $event"
    />
    
    <button type="submit" :disabled="!captchaReady || submitting">
      Submit
    </button>
    
    <p v-if="captchaError" style="color: red">
      {{ captchaError.message }}
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Turnstile, type TurnstileHandle } from '@better-captcha/vue/provider/turnstile';

const email = ref('');
const captchaRef = ref<TurnstileHandle | null>(null);
const captchaReady = ref(false);
const captchaError = ref<Error | null>(null);
const submitting = ref(false);

const handleSubmit = async () => {
  const token = captchaRef.value?.getResponse();
  if (!token) {
    alert('Please complete the CAPTCHA');
    return;
  }
  
  submitting.value = true;
  try {
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        captchaToken: token,
      }),
    });
    
    // Reset form
    email.value = '';
    captchaRef.value?.reset();
  } catch (error) {
    console.error('Submission error:', error);
  } finally {
    submitting.value = false;
  }
};
</script>
```

## TypeScript

Full TypeScript support with provider-specific types:

```typescript
import type {
  TurnstileHandle,
  RenderParameters as TurnstileOptions,
} from '@better-captcha/vue/provider/turnstile';

import type {
  HCaptchaHandle,
  RenderParameters as HCaptchaOptions,
} from '@better-captcha/vue/provider/hcaptcha';
```

## License

MIT © [LuggaPugga](https://github.com/LuggaPugga)

