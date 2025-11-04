import type {
	CaptchaCallbacks,
	CaptchaHandle,
	CaptchaState,
	Provider,
	ProviderConfig,
	ScriptOptions,
	WidgetId,
} from "../provider";

/**
 * Framework-agnostic controller for managing CAPTCHA lifecycle
 * Handles rendering, cleanup, state management, and provider instance lifecycle
 */
export class CaptchaController<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
> {
	private identifier: string | undefined;
	private options: TOptions | undefined;
	private scriptOptions: ScriptOptions | undefined;
	private callbacks: CaptchaCallbacks | undefined;
	private hostElement: HTMLElement | null = null;
	private container: HTMLDivElement | null = null;
	private provider: TProvider | null = null;
	private widgetId: WidgetId | null = null;
	private renderToken = 0;
	private isRendering = false;
	private pendingRender = false;
	private state: CaptchaState = {
		loading: false,
		error: null,
		ready: false,
	};
	private stateChangeListeners: Set<(state: CaptchaState) => void> = new Set();

	constructor(private providerFactory: (identifier: string, scriptOptions?: ScriptOptions) => TProvider) {}

	/**
	 * Set the identifier (sitekey or endpoint)
	 */
	setIdentifier(identifier: string | undefined): void {
		this.identifier = identifier;
	}

	/**
	 * Set render options
	 */
	setOptions(options: TOptions | undefined): void {
		this.options = options;
	}

	/**
	 * Set script options
	 */
	setScriptOptions(scriptOptions: ScriptOptions | undefined): void {
		this.scriptOptions = scriptOptions;
	}

	/**
	 * Set lifecycle callbacks
	 */
	setCallbacks(callbacks: CaptchaCallbacks | undefined): void {
		this.callbacks = callbacks;
	}

	/**
	 * Subscribe to state changes
	 */
	onStateChange(listener: (state: CaptchaState) => void): () => void {
		this.stateChangeListeners.add(listener);
		// Immediately call with current state
		listener(this.state);
		return () => {
			this.stateChangeListeners.delete(listener);
		};
	}

	/**
	 * Attach the host element where the captcha will be rendered
	 */
	attachHost(element: HTMLElement | null): void {
		this.hostElement = element;
	}

	/**
	 * Update internal state and notify listeners
	 */
	private updateState(newState: CaptchaState): void {
		this.state = newState;
		for (const listener of this.stateChangeListeners) {
			listener(this.state);
		}
	}

	/**
	 * Render the captcha widget
	 */
	async render(): Promise<void> {
		if (!this.hostElement) {
			return;
		}

		if (!this.identifier) {
			const error = new Error("Identifier (sitekey or endpoint) must be provided");
			this.updateState({ loading: false, error, ready: false });
			this.callbacks?.onError?.(error);
			return;
		}

		if (this.isRendering) {
			this.pendingRender = true;
			return;
		}

		this.isRendering = true;
		this.pendingRender = false;
		this.cleanup();

		const token = ++this.renderToken;
		this.updateState({ loading: true, error: null, ready: false });

		let mountTarget: HTMLDivElement | null = null;

		try {
			const activeProvider = this.providerFactory(this.identifier, this.scriptOptions);
			await activeProvider.init();

			// Check if render was cancelled
			if (token !== this.renderToken) {
				this.isRendering = false;
				return;
			}

			mountTarget = document.createElement("div");
			this.hostElement.appendChild(mountTarget);

			const callbacks: CaptchaCallbacks = {
				onReady: () => {
					if (token === this.renderToken) {
						this.callbacks?.onReady?.();
					}
				},
				onSolve: (solveToken: string) => {
					if (token === this.renderToken) {
						this.callbacks?.onSolve?.(solveToken);
					}
				},
				onError: (err: Error | string) => {
					if (token === this.renderToken) {
						const error = err instanceof Error ? err : new Error(String(err));
						this.callbacks?.onError?.(error);
					}
				},
			};

			const id = await activeProvider.render(mountTarget, this.options, callbacks);

			// Check if render was cancelled
			if (token !== this.renderToken) {
				mountTarget.remove();
				this.isRendering = false;
				return;
			}

			this.provider = activeProvider;
			this.container = mountTarget;
			this.widgetId = id ?? null;
			this.updateState({ loading: false, error: null, ready: true });
		} catch (error) {
			mountTarget?.remove();

			// Check if render was cancelled
			if (token !== this.renderToken) {
				this.isRendering = false;
				return;
			}

			const err = error instanceof Error ? error : new Error(String(error));
			console.error("[better-captcha] render:", err);
			this.updateState({ loading: false, error: err, ready: false });
			this.callbacks?.onError?.(err);
		} finally {
			this.isRendering = false;
			if (this.pendingRender) {
				this.pendingRender = false;
				queueMicrotask(() => {
					void this.render();
				});
			}
		}
	}

	/**
	 * Clean up resources and destroy the widget
	 */
	cleanup(): void {
		if (this.provider && this.widgetId != null) {
			try {
				this.provider.destroy(this.widgetId);
			} catch (error) {
				console.warn("[better-captcha] cleanup:", error);
			}
		}
		if (this.container) {
			this.container.remove();
		}
		this.provider = null;
		this.container = null;
		this.widgetId = null;
		this.updateState({ loading: false, error: null, ready: false });
	}

	/**
	 * Get the current widget ID
	 */
	getWidgetId(): WidgetId | null {
		return this.widgetId;
	}

	/**
	 * Get the current state
	 */
	getState(): CaptchaState {
		return this.state;
	}

	/**
	 * Get a handle for controlling the widget
	 */
	getHandle(): CaptchaHandle & THandle {
		if (!this.provider || this.widgetId == null) {
			return {
				execute: async () => {
					if (this.provider && this.widgetId) {
						await this.provider.execute(this.widgetId);
					}
				},
				reset: () => {
					if (this.provider && this.widgetId) {
						this.provider.reset(this.widgetId);
					}
				},
				destroy: () => {},
				render: async () => {
					await this.render();
				},
				getResponse: () => "",
				getComponentState: () => this.state,
			} as CaptchaHandle & THandle;
		}

		const baseHandle = this.provider.getHandle(this.widgetId);
		return {
			...baseHandle,
			getComponentState: () => this.state,
			destroy: () => {
				this.cleanup();
			},
			render: async () => {
				await this.render();
			},
		} as CaptchaHandle & THandle;
	}
}
