import type { RuntimeProviderClass } from "./provider";

export interface ProviderMetadataInput<TName extends string> {
	name: TName;
	componentName: string;
	providerClassName: string;
	handleType: string;
	renderParamsType: string;
	renderParamsOmit: string;
	extraTypes: string[];
	solvePayloadType?: string;
	/** The prop name to use for the identifier (default: "sitekey") */
	identifierProp?: "sitekey" | "endpoint";
	loadProviderClass: () => Promise<RuntimeProviderClass>;
}

function defineProviderMetadata<TName extends string>(metadata: ProviderMetadataInput<TName>) {
	return metadata;
}

export const PROVIDER_REGISTRY = [
	defineProviderMetadata({
		name: "altcha",
		componentName: "Altcha",
		providerClassName: "AltchaProvider",
		handleType: "AltchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"element"',
		extraTypes: [],
		identifierProp: "endpoint",
		loadProviderClass: async () => (await import("./providers/altcha")).AltchaProvider,
	}),
	defineProviderMetadata({
		name: "cap-widget",
		componentName: "CapWidget",
		providerClassName: "CapWidgetProvider",
		handleType: "CapWidgetHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"element"',
		extraTypes: [],
		identifierProp: "endpoint",
		loadProviderClass: async () => (await import("./providers/cap-widget")).CapWidgetProvider,
	}),
	defineProviderMetadata({
		name: "captcha-fox",
		componentName: "CaptchaFox",
		providerClassName: "CaptchaFoxProvider",
		handleType: "CaptchaFoxHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"element" | "sitekey"',
		extraTypes: [],
		loadProviderClass: async () => (await import("./providers/captcha-fox")).CaptchaFoxProvider,
	}),
	defineProviderMetadata({
		name: "friendly-captcha",
		componentName: "FriendlyCaptcha",
		providerClassName: "FriendlyCaptchaProvider",
		handleType: "FriendlyCaptchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"element" | "sitekey"',
		extraTypes: [],
		loadProviderClass: async () => (await import("./providers/friendly-captcha")).FriendlyCaptchaProvider,
	}),
	defineProviderMetadata({
		name: "hcaptcha",
		componentName: "HCaptcha",
		providerClassName: "HCaptchaProvider",
		handleType: "HCaptchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
		loadProviderClass: async () => (await import("./providers/hcaptcha")).HCaptchaProvider,
	}),
	defineProviderMetadata({
		name: "private-captcha",
		componentName: "PrivateCaptcha",
		providerClassName: "PrivateCaptchaProvider",
		handleType: "PrivateCaptchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
		loadProviderClass: async () => (await import("./providers/private-captcha")).PrivateCaptchaProvider,
	}),
	defineProviderMetadata({
		name: "prosopo",
		componentName: "Prosopo",
		providerClassName: "ProsopoProvider",
		handleType: "ProsopoHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"siteKey"',
		extraTypes: ["CallbackFunction", "CaptchaType", "Theme", "WidgetApi"],
		loadProviderClass: async () => (await import("./providers/prosopo")).ProsopoProvider,
	}),
	defineProviderMetadata({
		name: "recaptcha",
		componentName: "ReCaptcha",
		providerClassName: "ReCaptchaProvider",
		handleType: "ReCaptchaHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
		loadProviderClass: async () => (await import("./providers/recaptcha")).ReCaptchaProvider,
	}),
	defineProviderMetadata({
		name: "recaptcha-v3",
		componentName: "ReCaptchaV3",
		providerClassName: "ReCaptchaV3Provider",
		handleType: "ReCaptchaV3Handle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"element" | "sitekey"',
		extraTypes: [],
		loadProviderClass: async () => (await import("./providers/recaptcha-v3")).ReCaptchaV3Provider,
	}),
	defineProviderMetadata({
		name: "turnstile",
		componentName: "Turnstile",
		providerClassName: "TurnstileProvider",
		handleType: "TurnstileHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
		loadProviderClass: async () => (await import("./providers/turnstile")).TurnstileProvider,
	}),
	defineProviderMetadata({
		name: "geetest",
		componentName: "Geetest",
		providerClassName: "GeetestProvider",
		handleType: "GeetestHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"captchaId"',
		extraTypes: ["GeetestSolveResponse"],
		solvePayloadType: "GeetestSolveResponse",
		loadProviderClass: async () => (await import("./providers/geetest")).GeetestProvider,
	}),
	defineProviderMetadata({
		name: "t-sec",
		componentName: "TSec",
		providerClassName: "TSecProvider",
		handleType: "TSecHandle",
		renderParamsType: "RenderParameters",
		renderParamsOmit: '"sitekey"',
		extraTypes: [],
		loadProviderClass: async () => (await import("./providers/t-sec")).TSecProvider,
	}),
];

export type ProviderMetadata = (typeof PROVIDER_REGISTRY)[number];
export type ProviderName = ProviderMetadata["name"];

export type { AltchaHandle } from "./providers/altcha";
export type { CapWidgetHandle } from "./providers/cap-widget";
export type { CaptchaFoxHandle } from "./providers/captcha-fox";
export type { FriendlyCaptchaHandle } from "./providers/friendly-captcha";
export type { GeetestHandle } from "./providers/geetest";
export type { HCaptchaHandle } from "./providers/hcaptcha";
export type { PrivateCaptchaHandle } from "./providers/private-captcha";
export type { ProsopoHandle } from "./providers/prosopo";
export type { ReCaptchaHandle } from "./providers/recaptcha";
export type { ReCaptchaV3Handle } from "./providers/recaptcha-v3";
export type { TSecHandle } from "./providers/t-sec";
export type { TurnstileHandle } from "./providers/turnstile";

export function getProviderMetadata(name: string): ProviderMetadata | undefined {
	return PROVIDER_REGISTRY.find((provider) => provider.name === name);
}

export function getAllProviderNames(): ProviderName[] {
	return PROVIDER_REGISTRY.map((provider) => provider.name);
}

export function isProviderName(name: string): name is ProviderName {
	return PROVIDER_REGISTRY.some((provider) => provider.name === name);
}

export function loadProviderClass(name: ProviderName): Promise<RuntimeProviderClass> {
	const provider = getProviderMetadata(name);
	if (!provider) {
		throw new Error(`Provider "${name}" is not registered.`);
	}

	return provider.loadProviderClass();
}

export function loadRegisteredProviderClass(name: string): Promise<RuntimeProviderClass> {
	if (!isProviderName(name)) {
		throw new Error(`Provider "${name}" is not registered.`);
	}

	return loadProviderClass(name);
}
