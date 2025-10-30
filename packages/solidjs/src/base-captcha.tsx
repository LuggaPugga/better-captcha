import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import { cleanup } from "@better-captcha/core/utils/lifecycle";
import { batch, createEffect, createMemo, createSignal, type JSX, onCleanup, onMount, splitProps } from "solid-js";
import type { CaptchaProps, CaptchaPropsWithEndpoint } from "./index";

type ValueProp = "sitekey" | "endpoint";

type PropsForValue<TOptions, THandle extends CaptchaHandle, TValue extends ValueProp> = TValue extends "sitekey"
	? CaptchaProps<TOptions, THandle>
	: CaptchaPropsWithEndpoint<TOptions, THandle>;

const BASE_KEYS = ["options", "class", "style", "autoRender", "onReady", "onError", "controller"] as const;

function createComponentInternal<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
	TValue extends ValueProp = "sitekey",
>(ProviderClass: new (sitekeyOrEndpoint: string) => TProvider, valueProp: TValue, errorMessage: string) {
	return function CaptchaComponent(allProps: PropsForValue<TOptions, THandle, TValue>): JSX.Element {
		const keys = [...BASE_KEYS, valueProp] as const;
		const [pickedProps, divProps] = splitProps(
			allProps as PropsForValue<TOptions, THandle, TValue>,
			keys as unknown as readonly (keyof PropsForValue<TOptions, THandle, TValue>)[],
		);
		const props = pickedProps as PropsForValue<TOptions, THandle, TValue>;

		const value = props[valueProp];
		if (!value) {
			throw new Error(errorMessage);
		}
		const provider = createMemo(() => new ProviderClass(value as string));
		const [elementRef, setElementRef] = createSignal<HTMLDivElement>();
		const [widgetId, setWidgetId] = createSignal<WidgetId | null>(null);
		const autoRender = () => props.autoRender ?? true;
		const [state, setState] = createSignal<CaptchaState>({
			loading: autoRender(),
			error: null,
			ready: false,
		});

		let containerRef: HTMLDivElement | null = null;
		let isRendering = false;
		let hasRendered = false;
		let pendingRender = false;

		const performCleanup = () => {
			cleanup(provider(), widgetId(), containerRef);
			containerRef = null;
			batch(() => {
				setWidgetId(null);
			});
		};

		const renderCaptcha = async () => {
			const element = elementRef();
			const currentProvider = provider();
			const options = props.options;

			if (!element) return;

			if (isRendering) {
				pendingRender = true;
				return;
			}

			isRendering = true;
			pendingRender = false;

			performCleanup();

			batch(() => {
				setWidgetId(null);
				setState({ loading: true, error: null, ready: false });
			});

			try {
				await currentProvider.init();

				const container = document.createElement("div");
				containerRef = container;
				element.appendChild(container);

				const id = await currentProvider.render(container, options);

				batch(() => {
					setWidgetId(id ?? null);
					setState({ loading: false, error: null, ready: true });
				});
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				console.error("[better-captcha] render:", err);
				batch(() => {
					setState({ loading: false, error: err, ready: false });
				});
				props.onError?.(err);
			} finally {
				isRendering = false;
				if (pendingRender) {
					pendingRender = false;
					queueMicrotask(() => {
						void renderCaptcha();
					});
				}
			}
		};

		onMount(() => {
			if (autoRender()) {
				void renderCaptcha();
			}
		});

		createEffect(() => {
			const element = elementRef();
			const shouldAutoRender = autoRender();
			props[valueProp];
			props.options;

			if (!element || !hasRendered) return;

			if (shouldAutoRender) {
				void renderCaptcha();
			}

			onCleanup(() => {
				performCleanup();
			});
		});

		createEffect(() => {
			if (state().ready) {
				hasRendered = true;
			}
		});

		const baseHandle = createMemo(() => {
			const id = widgetId();
			if (id == null) return null;
			return provider().getHandle(id) as THandle;
		});

		const handle = createMemo(() => {
			const id = widgetId();
			const base = baseHandle();
			if (!base || id == null) {
				return {
					execute: async () => {},
					reset: () => {},
					destroy: () => {},
					render: async () => {
						await renderCaptcha();
					},
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
						setState({ loading: false, error: null, ready: false });
					});
				},
				render: async () => {
					await renderCaptcha();
				},
				getComponentState: () => state(),
			} as THandle;
		});

		createEffect(() => {
			const currentHandle = handle();
			const controller = props.controller;

			if (controller) {
				controller.set(currentHandle);
			}

			if (currentHandle) {
				props.onReady?.(currentHandle);
			}
		});

		const elementId = createMemo(() => {
			const id = widgetId();
			return id !== null && id !== undefined ? `better-captcha-${id}` : "better-captcha-loading";
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

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(ProviderClass: new (sitekeyOrEndpoint: string) => TProvider) {
	return createComponentInternal<TOptions, THandle, TProvider, "sitekey">(
		ProviderClass,
		"sitekey",
		"'sitekey' prop must be provided",
	);
}

export function createCaptchaComponentWithEndpoint<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(ProviderClass: new (sitekeyOrEndpoint: string) => TProvider) {
	return createComponentInternal<TOptions, THandle, TProvider, "endpoint">(
		ProviderClass,
		"endpoint",
		"'endpoint' prop must be provided",
	);
}
