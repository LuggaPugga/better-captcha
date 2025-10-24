import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";

export class CaptchaLifecycle<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle> {
	elementRef: HTMLDivElement | null = null;
	widgetIdRef: WidgetId | null = null;
	containerRef: HTMLDivElement | null = null;
	cancelled = false;

	state: CaptchaState = {
		loading: true,
		error: null,
		ready: false,
	};

	constructor(
		private provider: Provider<ProviderConfig, TOptions, THandle>,
		private options: TOptions | undefined,
		private onStateChange: (state: CaptchaState) => void,
	) {}

	async initialize(element: HTMLDivElement) {
		this.elementRef = element;
		this.cancelled = false;
		this.updateState({ loading: true, error: null, ready: false });

		try {
			await this.provider.init();
			if (this.cancelled) return;

			const container = document.createElement("div");
			this.containerRef = container;
			element.appendChild(container);

			const id = await this.provider.render(container, this.options);
			if (this.cancelled) {
				if (id != null) {
					try {
						this.provider.destroy(id);
					} catch (err) {
						console.warn("[better-captcha] cleanup (cancel):", err);
					}
				}
				container.remove();
				if (this.containerRef === container) this.containerRef = null;
				this.widgetIdRef = null;
				this.elementRef = null;
				this.updateState({ loading: false, error: null, ready: false });
				return;
			}

			this.widgetIdRef = id ?? null;
			this.updateState({ loading: false, error: null, ready: true });
		} catch (error) {
			// ensure no orphan container/refs on failure
			this.containerRef?.remove();
			this.containerRef = null;
			this.widgetIdRef = null;
			if (this.cancelled) {
				this.updateState({ loading: false, error: null, ready: false });
				return;
			}
			console.error("[better-captcha] init/render:", error);
			this.updateState({
				loading: false,
				error: error instanceof Error ? error : new Error(String(error)),
				ready: false,
			});
		}
	}

	cleanup() {
		this.cancelled = true;
		const id = this.widgetIdRef;
		if (id != null) {
			try {
				this.provider.destroy(id);
			} catch (error) {
				console.warn("[better-captcha] cleanup:", error);
			}
		}
		this.containerRef?.remove();
		this.widgetIdRef = null;
	}

	private updateState(newState: CaptchaState) {
		this.state = newState;
		this.onStateChange(newState);
	}
}
