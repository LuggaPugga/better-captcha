# Changelog

## [0.1.1] - 2025-10-15

### Added
- Initial release of `@better-captcha/vue`
- Vue 3 Composition API support for all CAPTCHA providers
- `useCaptcha()` composable for advanced control
- Template ref support for direct handle access
- Full TypeScript support with clean type definitions
- Auto-generated provider components
- Support for all major CAPTCHA providers:
  - Cloudflare Turnstile
  - hCaptcha
  - Google reCAPTCHA
  - Friendly Captcha
  - Private Captcha
  - Captcha Fox
  - Prosopo

### Features
- Unified API across all providers
- Reactive state management
- Event-driven architecture (`@ready`, `@error`)
- Dynamic provider switching
- Tree-shakeable imports
- Full SSR compatibility

