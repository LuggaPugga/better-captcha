import type {
	CaptchaCallbacks,
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import { batch, createEffect, createMemo, createSignal, type JSX, onCleanup, onMount, splitProps } from "solid-js";
import type { CaptchaProps } from "./index";

const BASE_KEYS = [
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
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(
	ProviderClass: new (identifier: string, scriptOptions?: ScriptOptions) => TProvider,
): (allProps: CaptchaProps<TOptions, THandle>) => JSX.Element {
	return function CaptchaComponent(allProps: CaptchaProps<TOptions, THandle>): JSX.Element {
		const [props, divProps] = splitProps(allProps, [...BASE_KEYS, "sitekey", "endpoint"] as const);
		const identifier = createMemo<string>(() => props.sitekey || props.endpoint || "");
		const autoRender = createMemo<boolean>(() => props.autoRender ?? true);

		const [elementRef, setElementRef] = createSignal<HTMLDivElement>();
		const [widgetId, setWidgetId] = createSignal<WidgetId | null>(null);
		const [state, setState] = createSignal<CaptchaState>({
			loading: autoRender(),
			error: null,
			ready: false,
		});

		let hasRendered = false;

		const controller = new CaptchaController<TOptions, THandle, TProvider>(
			(id: string, script?: ScriptOptions) => new ProviderClass(id, script),
		);

		controller.onStateChange((newState) => {
			batch(() => {
				setState(newState);
				setWidgetId(controller.getWidgetId());
			});
		});

		createEffect(() => {
			const el = elementRef();
			controller.attachHost(el ?? null);
		});

		createEffect(() => {
			controller.setIdentifier(identifier());
		});

		createEffect(() => {
			controller.setScriptOptions(props.scriptOptions);
		});

		createEffect(() => {
			controller.setOptions(props.options);
		});

		createEffect(() => {
			const callbacks: CaptchaCallbacks = {
				onReady: () => {
					props.onReady?.(handle());
				},
				onSolve: (token: string) => {
					props.onSolve?.(token);
				},
				onError: (err: Error | string) => {
					const error = err instanceof Error ? err : new Error(String(err));
					props.onError?.(error);
				},
			};
			controller.setCallbacks(callbacks);
		});

		const renderCaptcha = async () => {
			await controller.render();
			setWidgetId(controller.getWidgetId());
		};

		onMount(() => {
			if (autoRender()) void renderCaptcha();
		});

		createEffect(() => {
			const el = elementRef();
			const _id = identifier();
			const _opts = props.options;
			const _scriptOpts = props.scriptOptions;
			if (!el || !hasRendered) return;
			if (autoRender()) void renderCaptcha();
		});

		createEffect(() => {
			if (state().ready) hasRendered = true;
		});

		const handle = createMemo<THandle>(() => {
			widgetId();
			return controller.getHandle();
		});

		createEffect(() => {
			const h = handle();
			props.controller?.set(h);
		});

		const elementId = createMemo(() =>
			widgetId() != null ? `better-captcha-${widgetId()}` : "better-captcha-loading",
		);

		onCleanup(() => {
			controller.cleanup();
		});

		return (
			<div
				{...divProps}
				id={elementId()}
				ref={setElementRef}
				class={props.class}
				style={props.style}
				aria-live="polite"
				aria-busy={state().loading}
			/>
		);
	};
}
