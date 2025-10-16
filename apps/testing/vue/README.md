# Vue Testing App

This is a testing application for `@better-captcha/vue` package.

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

The app will be available at `http://localhost:9002`

## Testing Providers

The app includes test components for all supported CAPTCHA providers:

- Turnstile (Cloudflare)
- hCaptcha
- reCAPTCHA (Google)
- Friendly Captcha
- Private Captcha
- Captcha Fox
- Prosopo

Each provider test includes:
- Widget rendering
- Execute/Reset/Destroy controls
- Response retrieval
- Theme switching (where applicable)
- Error handling

