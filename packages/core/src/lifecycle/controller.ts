import type { CaptchaCallbacks, CaptchaHandle, CaptchaState, Provider, ScriptOptions, WidgetId } from "../provider";

export class CaptchaController<
	TOptions = unknown,
	TResponse = string,
	TSolve = TResponse,
	THandle extends CaptchaHandle<TResponse> = CaptchaHandle<TResponse>,
> {
	private identifier: string | undefined;
	private options: TOptions | undefined;
	private scriptOptions: ScriptOptions | undefined;
	private callbacks: CaptchaCallbacks<TSolve> | undefined;
	private hostElement: HTMLElement | null = null;
	private container: HTMLDivElement | null = null;
	private provider: Provider<TOptions, THandle, TResponse, TSolve> | null = null;
	private widgetId: WidgetId | null = null;
	private renderToken = 0;
	private state: CaptchaState = {
		loading: false,
		error: null,
		ready: false,
	};
	private stateChangeListeners: Set<(state: CaptchaState) => void> = new Set();

	constructor(
		private providerFactory: (
			identifier: string,
			scriptOptions?: ScriptOptions,
		) => Provider<TOptions, THandle, TResponse, TSolve>,
	) {}

	setIdentifier(identifier: string | undefined): void {
		this.identifier = identifier;
	}

	setOptions(options: TOptions | undefined): void {
		this.options = options;
	}

	setScriptOptions(scriptOptions: ScriptOptions | undefined): void {
		this.scriptOptions = scriptOptions;
	}

	setCallbacks(callbacks: CaptchaCallbacks<TSolve> | undefined): void {
		this.callbacks = callbacks;
	}

	onStateChange(listener: (state: CaptchaState) => void): () => void {
		this.stateChangeListeners.add(listener);
		listener(this.state);
		return () => {
			this.stateChangeListeners.delete(listener);
		};
	}

	attachHost(element: HTMLElement | null): void {
		this.hostElement = element;
	}

	private updateState(newState: CaptchaState): void {
		this.state = newState;
		for (const listener of this.stateChangeListeners) {
			listener(this.state);
		}
	}

	/** A newer render or cleanup invalidates this render at each async checkpoint. */
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

		this.teardown();
		const token = this.renderToken;
		this.updateState({ loading: true, error: null, ready: false });

		let mountTarget: HTMLDivElement | null = null;
		let readyBeforeCommit = false;
		let committed = false;

		try {
			const activeProvider = this.providerFactory(this.identifier, this.scriptOptions);
			await activeProvider.init();
			if (token !== this.renderToken) return;

			mountTarget = document.createElement("div");
			this.hostElement.appendChild(mountTarget);

			const callbacks: CaptchaCallbacks<TSolve> = {
				onReady: () => {
					if (token !== this.renderToken) return;
					if (committed) {
						this.callbacks?.onReady?.();
					} else {
						readyBeforeCommit = true;
					}
				},
				onSolve: (solveToken: TSolve) => {
					if (token === this.renderToken) this.callbacks?.onSolve?.(solveToken);
				},
				onError: (err: Error | string) => {
					if (token === this.renderToken) this.callbacks?.onError?.(err);
				},
			};

			const id = await activeProvider.render(mountTarget, this.options, callbacks);
			if (token !== this.renderToken) {
				if (id != null) {
					try {
						activeProvider.destroy(id);
					} catch (error) {
						console.warn("[better-captcha] cancelled render cleanup:", error);
					}
				}
				mountTarget.remove();
				return;
			}

			this.provider = activeProvider;
			this.container = mountTarget;
			this.widgetId = id ?? null;
			committed = true;
			this.updateState({ loading: false, error: null, ready: true });
			if (readyBeforeCommit) this.callbacks?.onReady?.();
		} catch (error) {
			mountTarget?.remove();
			if (token !== this.renderToken) return;

			const err = error instanceof Error ? error : new Error(String(error));
			console.error("[better-captcha] render:", err);
			this.updateState({ loading: false, error: err, ready: false });
			this.callbacks?.onError?.(err);
		}
	}

	/** Invalidates pending renders before destroying the current widget. */
	cleanup(): void {
		this.teardown();
	}

	private teardown(): void {
		this.renderToken++;
		if (this.provider && this.widgetId != null) {
			try {
				this.provider.destroy(this.widgetId);
			} catch (error) {
				console.warn("[better-captcha] cleanup:", error);
			}
		}
		this.container?.remove();
		this.provider = null;
		this.container = null;
		this.widgetId = null;
		this.updateState({ loading: false, error: null, ready: false });
	}

	getWidgetId(): WidgetId | null {
		return this.widgetId;
	}

	getState(): CaptchaState {
		return this.state;
	}

	getHandle(): CaptchaHandle<TResponse> & THandle {
		if (!this.provider || this.widgetId == null) {
			return {
				execute: async () => {
					if (this.provider && this.widgetId != null) {
						await this.provider.execute(this.widgetId);
					}
				},
				reset: () => {
					if (this.provider && this.widgetId != null) {
						this.provider.reset(this.widgetId);
					}
				},
				destroy: () => {
					this.cleanup();
				},
				render: async () => {
					await this.render();
				},
				getResponse: () => "" as TResponse,
				getComponentState: () => this.state,
			} as CaptchaHandle<TResponse> & THandle;
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
		} as CaptchaHandle<TResponse> & THandle;
	}
}
