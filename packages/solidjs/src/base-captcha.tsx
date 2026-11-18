import type { CaptchaHandle, Provider, ScriptOptions } from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, omit, onCleanup } from "solid-js";
import type { CaptchaProps } from "./index";

/** Props consumed by the captcha component; everything else is forwarded to the host `<div>`. */
export const CAPTCHA_PROP_KEYS = [
	"sitekey",
	"endpoint",
	"options",
	"scriptOptions",
	"class",
	"style",
	"autoRender",
	"onReady",
	"onError",
	"onSolve",
	"controller",
] as const;

export function createCaptchaComponent<
	TOptions = unknown,
	TResponse = string,
	TSolve = string,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
	TProvider extends Provider<TOptions, THandle, TResponse, TSolve> = Provider<TOptions, THandle, TResponse, TSolve>,
>(
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => TProvider,
): (props: CaptchaProps<TOptions, THandle, TSolve>) => JSX.Element {
	return function CaptchaComponent(props: CaptchaProps<TOptions, THandle, TSolve>): JSX.Element {
		const divProps = omit(props, ...CAPTCHA_PROP_KEYS);
		let host: HTMLDivElement | undefined;

		const controller = new CaptchaController<TOptions, TResponse, TSolve, THandle>(
			(id, script) => new ProviderClass(id, script),
		);
		controller.setCallbacks({
			onReady: () => props.onReady?.(controller.getHandle()),
			onSolve: (token) => props.onSolve?.(token),
			onError: (err) => props.onError?.(err instanceof Error ? err : new Error(String(err))),
		});

		// The controller assigns the widget id before it publishes a new state, so one
		// subscription keeps both in sync. It also replays the current state on subscribe,
		// from the component body, which Solid 2 only allows with `ownedWrite`.
		const snapshot = () => ({ state: controller.getState(), widgetId: controller.getWidgetId() });
		const [current, setCurrent] = createSignal(snapshot(), { ownedWrite: true });
		const unsubscribe = controller.onStateChange(() => setCurrent(snapshot()));

		const widgetId = createMemo(() => current().widgetId);
		const isLoading = createMemo(() => {
			const { loading, ready } = current().state;
			return (props.autoRender ?? true) ? loading || !ready : loading;
		});

		createEffect(
			() => ({
				identifier: props.sitekey || props.endpoint || "",
				options: props.options,
				scriptOptions: props.scriptOptions,
				autoRender: props.autoRender ?? true,
			}),
			({ identifier, options, scriptOptions, autoRender }) => {
				controller.attachHost(host ?? null);
				controller.setIdentifier(identifier);
				controller.setScriptOptions(scriptOptions);
				controller.setOptions(options);
				if (autoRender) void controller.render();
			},
		);

		createEffect(
			() => {
				widgetId();
				return props.controller;
			},
			(captchaController) => captchaController?.set(controller.getHandle()),
		);

		onCleanup(() => {
			unsubscribe();
			controller.cleanup();
		});

		return (
			<div
				{...divProps}
				id={widgetId() != null ? `better-captcha-${widgetId()}` : "better-captcha-loading"}
				ref={host}
				class={props.class}
				style={props.style}
				aria-live="polite"
				aria-busy={isLoading() ? "true" : "false"}
			/>
		);
	};
}
