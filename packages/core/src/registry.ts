import { CapWidgetProvider } from "./providers/cap-widget";
import { CaptchaFoxProvider } from "./providers/captcha-fox";
import { FriendlyCaptchaProvider } from "./providers/friendly-captcha";
import { HCaptchaProvider } from "./providers/hcaptcha";
import { PrivateCaptchaProvider } from "./providers/private-captcha";
import { ProsopoProvider } from "./providers/prosopo";
import { ReCaptchaProvider } from "./providers/recaptcha";
import { TurnstileProvider } from "./providers/turnstile";

export interface ProviderMetadata {
	name: string;
	componentName: string;
	providerClassName: string;
	handleType: string;
	renderParamsType: string;
	renderParamsOmit: string;
	extraTypes: string[];
	/** The prop name to use for the identifier (default: "sitekey") */
	identifierProp?: "sitekey" | "endpoint";
}

export const PROVIDER_REGISTRY: ProviderMetadata[] = [
	{
		name: "cap-widget",
		componentName: "CapWidget",
		providerClassName: "CapWidgetProvider",
		handleType: "CapWidgetHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"element"',
		extraTypes: [],
		identifierProp: "endpoint",
	},
	{
		name: "captcha-fox",
		componentName: "CaptchaFox",
		providerClassName: "CaptchaFoxProvider",
		handleType: "CaptchaFoxHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"element" | "sitekey"',
		extraTypes: [],
	},
	{
		name: "friendly-captcha",
		componentName: "FriendlyCaptcha",
		providerClassName: "FriendlyCaptchaProvider",
		handleType: "FriendlyCaptchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"element" | "sitekey"',
		extraTypes: [],
	},
	{
		name: "hcaptcha",
		componentName: "HCaptcha",
		providerClassName: "HCaptchaProvider",
		handleType: "HCaptchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
	},
	{
		name: "private-captcha",
		componentName: "PrivateCaptcha",
		providerClassName: "PrivateCaptchaProvider",
		handleType: "PrivateCaptchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
	},
	{
		name: "prosopo",
		componentName: "Prosopo",
		providerClassName: "ProsopoProvider",
		handleType: "ProsopoHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"siteKey"',
		extraTypes: ["CallbackFunction", "CaptchaType", "Theme", "WidgetApi"],
	},
	{
		name: "recaptcha",
		componentName: "ReCaptcha",
		providerClassName: "ReCaptchaProvider",
		handleType: "ReCaptchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
	},
	{
		name: "turnstile",
		componentName: "Turnstile",
		providerClassName: "TurnstileProvider",
		handleType: "TurnstileHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
	},
];

export const PROVIDER_CLASSES = {
	CapWidgetProvider,
	CaptchaFoxProvider,
	FriendlyCaptchaProvider,
	HCaptchaProvider,
	PrivateCaptchaProvider,
	ProsopoProvider,
	ReCaptchaProvider,
	TurnstileProvider,
} as const;

export type { CapWidgetHandle } from "./providers/cap-widget";
export type { CaptchaFoxHandle } from "./providers/captcha-fox";
export type { FriendlyCaptchaHandle } from "./providers/friendly-captcha";
export type { HCaptchaHandle } from "./providers/hcaptcha";
export type { PrivateCaptchaHandle } from "./providers/private-captcha";
export type { ProsopoHandle } from "./providers/prosopo";
export type { ReCaptchaHandle } from "./providers/recaptcha";
export type { TurnstileHandle } from "./providers/turnstile";

export function getProviderMetadata(name: string): ProviderMetadata | undefined {
	return PROVIDER_REGISTRY.find((provider) => provider.name === name);
}

export function getAllProviderNames(): string[] {
	return PROVIDER_REGISTRY.map((provider) => provider.name);
}
