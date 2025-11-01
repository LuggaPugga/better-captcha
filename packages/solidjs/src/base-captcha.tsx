import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import { cleanup } from "@better-captcha/core/utils/lifecycle";
import { batch, createEffect, createMemo, createSignal, type JSX, onCleanup, onMount, splitProps } from "solid-js";
import type { CaptchaProps } from "./index";

const BASE_KEYS = ["options", "class", "style", "autoRender", "onReady", "onError", "controller"] as const;

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(ProviderClass: new (identifier: string) => TProvider): (allProps: CaptchaProps<TOptions, THandle>) => JSX.Element {
	return function CaptchaComponent(allProps: CaptchaProps<TOptions, THandle>): JSX.Element {
		const [props, divProps] = splitProps(allProps, [...BASE_KEYS, "sitekey", "endpoint"] as const);
		const identifier = createMemo<string>(() => props.sitekey || props.endpoint || "");
		const autoRender = createMemo<boolean>(() => props.autoRender ?? true);

		const provider = createMemo<TProvider | null>(() => {
			const id = identifier();
			return id ? new ProviderClass(id) : null;
		});

		const [elementRef, setElementRef] = createSignal<HTMLDivElement>();
		const [widgetId, setWidgetId] = createSignal<WidgetId | null>(null);
		const [state, setState] = createSignal<CaptchaState>({
			loading: autoRender(),
			error: null,
			ready: false,
		});

		let containerRef: HTMLDivElement | null = null;
		let isRendering = false;
		let hasRendered = false;
		let pendingRender = false;

		const setLoading = (loading: boolean) => setState((s) => ({ ...s, loading }));
		const setReady = (ready: boolean) => setState((s) => ({ ...s, ready }));
		const setError = (error: Error | null) => setState((s) => ({ ...s, error }));

		const performCleanup = () => {
			cleanup(provider(), widgetId(), containerRef);
			containerRef = null;
			setWidgetId(null);
		};

		const renderCaptcha = async () => {
			const element = elementRef();
			const currentProvider = provider();
			if (!element || !currentProvider) return;

			if (isRendering) {
				pendingRender = true;
				return;
			}

			isRendering = true;
			pendingRender = false;

			performCleanup();
			batch(() => {
				setWidgetId(null);
				setLoading(true);
				setError(null);
				setReady(false);
			});

			try {
				await currentProvider.init();

				const container = document.createElement("div");
				containerRef = container;
				element.appendChild(container);

				const id = await currentProvider.render(container, props.options);

				batch(() => {
					setWidgetId(id ?? null);
					setLoading(false);
					setReady(true);
				});
			} catch (e) {
				const err = e instanceof Error ? e : new Error(String(e));
				console.error("[better-captcha] render:", err);
				batch(() => {
					setLoading(false);
					setError(err);
					setReady(false);
				});
				props.onError?.(err);
			} finally {
				isRendering = false;
				if (pendingRender) {
					pendingRender = false;
					queueMicrotask(() => void renderCaptcha());
				}
			}
		};

		onMount(() => {
			if (autoRender()) void renderCaptcha();
		});

		createEffect(() => {
			const el = elementRef();
			const _id = identifier();
			const _opts = props.options;
			if (!el || !hasRendered) return;
			if (autoRender()) void renderCaptcha();
		});

		createEffect(() => {
			if (state().ready) hasRendered = true;
		});

		const baseHandle = createMemo<THandle | null>(() => {
			const id = widgetId();
			const currentProvider = provider();
			return id != null && currentProvider ? (currentProvider.getHandle(id) as THandle) : null;
		});

		const handle = createMemo<THandle>(() => {
			const base = baseHandle();
			if (!base) {
				return {
					execute: async () => {},
					reset: () => {},
					destroy: () => {},
					render: () => renderCaptcha(),
					getResponse: () => "",
					getComponentState: () => state(),
				} as THandle;
			}

			return {
				...base,
				destroy: () => {
					base.destroy();
					performCleanup();
					batch(() => {
						setLoading(false);
						setError(null);
						setReady(false);
					});
				},
				render: async () => void renderCaptcha(),
				getComponentState: () => state(),
			} as THandle;
		});

		createEffect(() => {
			const h = handle();
			props.controller?.set(h);
			if (state().ready) {
				props.onReady?.(h);
			}
		});

		const elementId = createMemo(() =>
			widgetId() != null ? `better-captcha-${widgetId()}` : "better-captcha-loading",
		);

		onCleanup(performCleanup);

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
