import type {
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "@better-captcha/core";
import { CaptchaController } from "@better-captcha/core";
import {
	batch,
	createEffect,
	createMemo,
	createSignal,
	type JSX,
	onCleanup,
	onMount,
	splitProps,
	untrack,
} from "solid-js";
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

		const identifier = createMemo(() => props.sitekey || props.endpoint || "");
		const autoRender = createMemo(() => props.autoRender ?? true);

		const [elementRef, setElementRef] = createSignal<HTMLDivElement>();
		const [widgetId, setWidgetId] = createSignal<WidgetId | null>(null);
		const [state, setState] = createSignal<CaptchaState>({
			loading: false,
			error: null,
			ready: false,
		});

		const isLoading = createMemo(() => (autoRender() ? state().loading || !state().ready : state().loading));

		let hasRendered = false;

		const controller = new CaptchaController<TOptions, THandle, TProvider>(
			(id, script) => new ProviderClass(id, script),
		);

		const unsubscribe = controller.onStateChange((newState) => {
			batch(() => {
				setState(newState);
				setWidgetId(controller.getWidgetId());
				if (newState.ready) hasRendered = true;
			});
		});

		createEffect(() => {
			const el = elementRef();
			const id = identifier();
			const opts = props.options;
			const sOpts = props.scriptOptions;

			controller.attachHost(el ?? null);
			controller.setIdentifier(id);
			controller.setScriptOptions(sOpts);
			controller.setOptions(opts);

			controller.setCallbacks({
				onReady: () => props.onReady?.(controller.getHandle()),
				onSolve: (token: string) => props.onSolve?.(token),
				onError: (err: Error | string) => {
					const error = err instanceof Error ? err : new Error(String(err));
					props.onError?.(error);
				},
			});
		});

		const renderCaptcha = async () => {
			await controller.render();
			setWidgetId(controller.getWidgetId());
		};

		onMount(() => {
			if (autoRender()) void renderCaptcha();
		});

		createEffect(() => {
			identifier();
			props.options;
			props.scriptOptions;

			untrack(() => {
				if (autoRender() && (hasRendered || state().error)) {
					void renderCaptcha();
				}
			});
		});

		createEffect(() => {
			const h = controller.getHandle();
			widgetId();
			untrack(() => props.controller?.set(h));
		});

		const elementId = createMemo(() =>
			widgetId() != null ? `better-captcha-${widgetId()}` : "better-captcha-loading",
		);

		onCleanup(() => {
			controller.cleanup();
			unsubscribe();
		});

		return (
			<div
				{...divProps}
				id={elementId()}
				ref={setElementRef}
				class={props.class}
				style={props.style}
				aria-live="polite"
				aria-busy={isLoading()}
			/>
		);
	};
}
