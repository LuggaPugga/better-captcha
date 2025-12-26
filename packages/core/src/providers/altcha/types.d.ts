declare global {
	interface Window {
		altchaI18n?: Map<string, Record<string, string>>;
	}
}

type AltchaWidgetState = "unverified" | "verifying" | "verified" | "error";

type AltchaFloatingMode = "auto" | "top" | "bottom";

type AltchaAutoMode = "off" | "onfocus" | "onload" | "onsubmit";

type AltchaCredentialsMode = "omit" | "same-origin" | "include";

interface AltchaStateChangeEventDetail {
	state: AltchaWidgetState;
	payload?: string;
}

interface AltchaVerifiedEventDetail {
	payload: string;
}

interface AltchaStateChangeEvent extends CustomEvent<AltchaStateChangeEventDetail> {}

interface AltchaVerifiedEvent extends CustomEvent<AltchaVerifiedEventDetail> {}

interface AltchaLoadEvent extends CustomEvent<void> {}

interface AltchaErrorEvent extends CustomEvent<{ message: string }> {}

interface AltchaCodeEvent extends CustomEvent<void> {}

interface AltchaSentinelVerificationEvent extends CustomEvent<unknown> {}

interface AltchaWidgetOptions {
	challengeurl?: string;
	challengejson?: string;
	auto?: AltchaAutoMode;
	credentials?: AltchaCredentialsMode;
	customfetch?: (url: string, init: RequestInit) => Promise<Response>;
	delay?: number;
	disableautofocus?: boolean;
	expire?: number;
	floating?: AltchaFloatingMode;
	floatinganchor?: string;
	floatingoffset?: number;
	floatingpersist?: boolean | "focus";
	hidefooter?: boolean;
	hidelogo?: boolean;
	id?: string;
	language?: string;
	maxnumber?: number;
	name?: string;
	overlay?: boolean;
	overlaycontent?: string;
	strings?: string;
	refetchonexpire?: boolean;
	workers?: number;
	workerurl?: string;
	obfuscated?: string;
	debug?: boolean;
	mockerror?: boolean;
	test?: boolean;
}

interface AltchaWidget extends HTMLElement {
	configure(options: AltchaWidgetOptions): void;
	getConfiguration(): AltchaWidgetOptions;
	getState(): AltchaWidgetState;
	show(): void;
	hide(): void;
	reset(state?: AltchaWidgetState, err?: Error): void;
	setState(state: AltchaWidgetState, err?: Error): void;
	setFloatingAnchor(element: HTMLElement): void;
	verify(): Promise<void>;
	addEventListener(type: "statechange", listener: (event: AltchaStateChangeEvent) => void): void;
	addEventListener(type: "verified", listener: (event: AltchaVerifiedEvent) => void): void;
	addEventListener(type: "load", listener: (event: AltchaLoadEvent) => void): void;
	addEventListener(type: "error", listener: (event: AltchaErrorEvent) => void): void;
	addEventListener(type: "code", listener: (event: AltchaCodeEvent) => void): void;
	addEventListener(type: "sentinelverification", listener: (event: AltchaSentinelVerificationEvent) => void): void;
	addEventListener(type: string, listener: EventListener): void;
	removeEventListener(type: "statechange", listener: (event: AltchaStateChangeEvent) => void): void;
	removeEventListener(type: "verified", listener: (event: AltchaVerifiedEvent) => void): void;
	removeEventListener(type: "load", listener: (event: AltchaLoadEvent) => void): void;
	removeEventListener(type: "error", listener: (event: AltchaErrorEvent) => void): void;
	removeEventListener(type: "code", listener: (event: AltchaCodeEvent) => void): void;
	removeEventListener(type: "sentinelverification", listener: (event: AltchaSentinelVerificationEvent) => void): void;
	removeEventListener(type: string, listener: EventListener): void;
}

declare global {
	interface HTMLElementTagNameMap {
		"altcha-widget": AltchaWidget;
	}
}

export type {
	AltchaWidget,
	AltchaWidgetOptions,
	AltchaWidgetState,
	AltchaFloatingMode,
	AltchaAutoMode,
	AltchaCredentialsMode,
	AltchaStateChangeEvent,
	AltchaStateChangeEventDetail,
	AltchaVerifiedEvent,
	AltchaVerifiedEventDetail,
	AltchaLoadEvent,
	AltchaErrorEvent,
	AltchaCodeEvent,
	AltchaSentinelVerificationEvent,
};

export interface RenderParameters {
	auto?: AltchaAutoMode;
	credentials?: AltchaCredentialsMode;
	delay?: number;
	disableautofocus?: boolean;
	expire?: number;
	floating?: AltchaFloatingMode;
	floatinganchor?: string;
	floatingoffset?: number;
	floatingpersist?: boolean | "focus";
	hidefooter?: boolean;
	hidelogo?: boolean;
	language?: string;
	maxnumber?: number;
	name?: string;
	overlay?: boolean;
	overlaycontent?: string;
	strings?: string;
	refetchonexpire?: boolean;
	workers?: number;
	workerurl?: string;
	debug?: boolean;
	test?: boolean;
	onstatechange?: (event: AltchaStateChangeEvent) => void;
	onverified?: (event: AltchaVerifiedEvent) => void;
	onload?: (event: AltchaLoadEvent) => void;
	onerror?: (event: AltchaErrorEvent) => void;
}
