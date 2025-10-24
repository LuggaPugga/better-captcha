import { betterAuth } from "better-auth";
import { captcha } from "better-auth/plugins";
export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		captcha({
			provider: "cloudflare-turnstile",
			secretKey: process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA", // test key that always passes
			endpoints: ["/sign-in/email", "/sign-up/email"],
		}),
	],
});
