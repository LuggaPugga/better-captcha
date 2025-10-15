import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import { batch, createEffect, createMemo, createSignal, type JSX, onCleanup, splitProps } from "solid-js";
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
			"onReady",
			"onError",
			"controller",
		]);

		const provider = createMemo(() => new ProviderClass(props.sitekey));

		const [elementRef, setElementRef] = createSignal<HTMLDivElement>();
		const [widgetId, setWidgetId] = createSignal<WidgetId | null>(null);
		const [state, setState] = createSignal<CaptchaState>({
			loading: true,
			error: null,
			ready: false,
		});

		let containerRef: HTMLDivElement | null = null;

		createEffect(() => {
			const element = elementRef();
			if (!element) return;

			const currentProvider = provider();
			const options = props.options;
			let cancelled = false;

			batch(() => {
				setWidgetId(null);
				setState({ loading: true, error: null, ready: false });
			});

			const renderCaptcha = async () => {
				try {
					await currentProvider.init();
					if (cancelled) return;

					const container = document.createElement("div");
					containerRef = container;
					element.appendChild(container);

					const id = await currentProvider.render(container, options);
					if (cancelled) {
						id != null && currentProvider.destroy(id);
						container.remove();
						return;
					}

					batch(() => {
						setWidgetId(id ?? null);
						setState({ loading: false, error: null, ready: true });
					});
				} catch (error) {
					if (!cancelled) {
						const err = error instanceof Error ? error : new Error(String(error));
						console.error("[better-captcha] render:", err);
						batch(() => {
							setState({ loading: false, error: err, ready: false });
						});
						props.onError?.(err);
					}
				}
			};

			renderCaptcha();

			onCleanup(() => {
				cancelled = true;
				const id = widgetId();
				if (id != null) {
					try {
						currentProvider.destroy(id);
					} catch (error) {
						console.warn("[better-captcha] cleanup:", error);
					}
				}
				containerRef?.remove();
				containerRef = null;
			});
		});
		const handle = createMemo(() => {
			const id = widgetId();
			const currentState = state();
			if (!currentState.ready || id == null) return null;

			const currentProvider = provider();
			const baseHandle = currentProvider.getHandle(id) as THandle;

			return {
				...baseHandle,
				destroy: () => {
					if (id != null) {
						baseHandle.destroy();
						containerRef?.remove();
						containerRef = null;
						batch(() => {
							setWidgetId(null);
							setState({ loading: true, error: null, ready: false });
						});
					}
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
