# Better Captcha - Deno Fresh Demo

A demo application showcasing [Better Captcha](https://better-captcha.dev) integration with Deno Fresh and Preact.

## Features

- **Privacy-focused CAPTCHA**: Uses Cloudflare Turnstile with a privacy-first approach
- **TypeScript**: Full type safety with Preact and Deno
- **Modern UI**: Clean, responsive design with Tailwind CSS v4
- **Dark mode support**: Automatic theme detection and switching
- **Island architecture**: Leverages Fresh's islands for interactive components

## Getting Started

### Prerequisites

Make sure you have Deno installed:
https://docs.deno.com/runtime/getting_started/installation

### Development

Start the development server:

```bash
deno task dev
```

This will watch the project directory and restart as necessary.

### Build

Build for production:

```bash
deno task build
```

### Production

Start the production server:

```bash
deno task start
```

## Project Structure

```
.
├── islands/
│   └── captcha-widget.tsx    # Interactive captcha component
├── routes/
│   ├── _app.tsx              # App layout
│   └── index.tsx             # Home page with demo
├── assets/
│   └── styles.css            # Tailwind CSS styles
├── utils.ts                  # App utilities
├── main.ts                   # App entry point
└── deno.json                 # Deno configuration
```

## Usage

The captcha component is located in `islands/captcha-widget.tsx`. It uses the `@better-captcha/preact` package to render a Turnstile captcha with the demo sitekey.

```tsx
import { Turnstile } from "@better-captcha/preact/provider/turnstile";

<Turnstile
  sitekey="1x00000000000000000000AA"
  options={{ theme: "auto" }}
  onSolve={(token) => console.log(token)}
/>
```

## License

MIT
