import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import { batch, createEffect, createMemo, createSignal, type JSX, onCleanup, onMount, splitProps } from "solid-js";
import type { CaptchaProps } from "./index";

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(ProviderClass: new (sitekey: string) => TProvider) {
	return function CaptchaComponent(allProps: CaptchaProps<TOptions, THandle>): JSX.Element {
		const [props, divProps] = splitProps(allProps, [
			"sitekey",
			"options",
			"class",
			"style",
			"autoRender",
			"onReady",
			"onError",
			"controller",
		]);

		const provider = createMemo(() => new ProviderClass(props.sitekey));
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

		const renderCaptcha = async () => {
			const element = elementRef();
			const currentProvider = provider();
			const options = props.options;

			if (!element || isRendering) return;

			isRendering = true;

			const currentId = widgetId();
			if (currentId != null) {
				try {
					currentProvider.destroy(currentId);
				} catch (error) {
					console.warn("[better-captcha] cleanup before render:", error);
				}
			}
			containerRef?.remove();
			containerRef = null;

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

			if (!element || !hasRendered) return;

			if (shouldAutoRender) {
				void renderCaptcha();
			}

			onCleanup(() => {
				const id = widgetId();
				if (id != null) {
					try {
						provider().destroy(id);
					} catch (error) {
						console.warn("[better-captcha] cleanup:", error);
					}
				}
				containerRef?.remove();
				containerRef = null;
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
					containerRef?.remove();
					containerRef = null;
					batch(() => {
						setWidgetId(null);
						setState({ loading: true, error: null, ready: false });
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
