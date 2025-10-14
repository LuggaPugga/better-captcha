# SolidJS CAPTCHA

SolidJS wrappers for CAPTCHA providers that share the same lifecycle, render flow, and control handle so you can swap vendors easily.

## Installation

```bash
npm install @better-captcha/solid
```

## Usage

```tsx
import { Recaptcha } from "@better-captcha/solid";

function App() {
  return (
    <Recaptcha
      sitekey="your-site-key"
      options={{
        theme: "dark",
        size: "compact"
      }}
    />
  );
}
```

## Supported Providers

- reCAPTCHA v2
- hCaptcha
- Cloudflare Turnstile
- Friendly Captcha
- CaptchaFox
- Prosopo
- Private Captcha

## Features

- **Consistent API**: All providers share the same component interface
- **TypeScript Support**: Full type safety for all providers
- **Reactive**: Built with SolidJS signals for optimal performance
- **Accessible**: ARIA attributes and screen reader support
- **Customizable**: Style with CSS classes and inline styles

## Development

This package is experimental and follows the same patterns as the React version but adapted for SolidJS's reactive system.

### Building

```bash
bun run build
```

### Development Mode

```bash
bun run dev
```

## License

MIT

