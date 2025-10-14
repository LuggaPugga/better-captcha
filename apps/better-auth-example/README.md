# Better Auth + React Captcha Example

This example demonstrates how to integrate [Better Auth](https://www.better-auth.com/) with the [better-captcha](https://github.com/LuggaPugga/better-captcha) library using Cloudflare Turnstile for bot protection.

## Features

- ✅ **Better Auth Integration** - Full-featured authentication with email/password support
- ✅ **Cloudflare Turnstile** - Bot protection using the better-captcha library
- ✅ **Auto Theme Detection** - Captcha automatically adapts to light/dark mode
- ✅ **Test Mode** - Uses always-pass keys for easy local development
- ✅ **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ✅ **TypeScript** - Fully typed for better developer experience

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository and navigate to this example:

```bash
cd apps/better-auth-example
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Run the development server:

```bash
bun dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### 1. Better Auth Configuration

The Better Auth instance is configured with the captcha plugin in `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";

export const auth = betterAuth({
  database: memoryAdapter,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA",
      endpoints: ["/sign-in/email", "/sign-up/email"],
    }),
  ],
});
```

### 2. React Captcha Integration

The authentication form uses the `Turnstile` component from better-captcha:

```typescript
import { Turnstile } from "better-captcha/provider/turnstile";

<Turnstile
  ref={turnstileRef}
  siteKey="1x00000000000000000000AA"
  options={{
    theme: "auto",
    size: "normal",
  }}
/>
```

### 3. Sending the Captcha Token

The captcha token is sent to Better Auth via the `x-captcha-response` header:

```typescript
await authClient.signIn.email(
  {
    email,
    password,
  },
  {
    onRequest: (ctx) => {
      ctx.headers.set("x-captcha-response", token);
    },
  },
);
```


## Learn More

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth Captcha Plugin](https://www.better-auth.com/docs/plugins/captcha)
- [React Captcha Library](https://github.com/LuggaPugga/better-captcha)
- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
