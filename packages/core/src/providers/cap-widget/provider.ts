import { type CaptchaHandle, Provider, type ProviderConfig } from "../../provider";
import { loadScript } from "../../utils/load-script";
import type { CapWidget, RenderParameters } from "./types";

export type CapWidgetHandle = CaptchaHandle;

export class CapWidgetProvider extends Provider<ProviderConfig, Omit<RenderParameters, "element">, CapWidgetHandle> {
	private widgetMap = new Map<string, CapWidget>();

	constructor(endpoint: string) {
		// Note: base class uses 'sitekey' parameter name, but for CapWidget this is actually the API endpoint
		super(
			{
				scriptUrl: "https://cdn.jsdelivr.net/npm/@cap.js/widget",
			},
			endpoint,
		);
	}

	async init() {
		await loadScript(this.config.scriptUrl, {
			type: "module",
			async: true,
			defer: true,
		});

		// Wait for the custom element to be defined
		if (typeof window !== "undefined" && customElements) {
			await customElements.whenDefined("cap-widget");
		}
	}

	render(element: HTMLElement, options?: Omit<RenderParameters, "element">): string {
		// Create the cap-widget element
		const widget = document.createElement("cap-widget") as CapWidget;

		// Set the API endpoint (using sitekey as the endpoint value)
		widget.setAttribute("data-cap-api-endpoint", this.sitekey);

		// Map camelCase props to data-cap-* attributes
		const attributeMap: Record<string, string> = {
			workerCount: "data-cap-worker-count",
			hiddenFieldName: "data-cap-hidden-field-name",
			i18nInitialState: "data-cap-i18n-initial-state",
			i18nVerifyingLabel: "data-cap-i18n-verifying-label",
			i18nSolvedLabel: "data-cap-i18n-solved-label",
			i18nErrorLabel: "data-cap-i18n-error-label",
			i18nVerifyAriaLabel: "data-cap-i18n-verify-aria-label",
			i18nVerifyingAriaLabel: "data-cap-i18n-verifying-aria-label",
			i18nVerifiedAriaLabel: "data-cap-i18n-verified-aria-label",
			i18nErrorAriaLabel: "data-cap-i18n-error-aria-label",
			i18nWasmDisabled: "data-cap-i18n-wasm-disabled",
		};

		// Apply options as attributes
		if (options) {
			for (const [key, value] of Object.entries(options)) {
				if (value !== undefined && value !== null) {
					const attributeName = attributeMap[key] || key;
					widget.setAttribute(attributeName, String(value));
				}
			}
		}

		// Append to element
		element.appendChild(widget);

		// Generate a unique ID for this widget
		const widgetId = `cap-widget-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
		widget.id = widgetId;

		// Listen for solve event - token is automatically stored in widget.token property
		widget.addEventListener("solve", () => {
			// Token is accessible via widget.token
		});

		// Store widget reference
		this.widgetMap.set(widgetId, widget);

		return widgetId;
	}

	reset(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			widget.reset();
		}
	}

	async execute(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (widget) {
			await widget.solve();
		}
	}

	destroy(widgetId: string) {
		const widget = this.widgetMap.get(widgetId);
		if (!widget) {
			return;
		}

		widget.remove();
		this.widgetMap.delete(widgetId);
	}

	getResponse(widgetId: string): string {
		const widget = this.widgetMap.get(widgetId);
		// CapWidget stores the token in the token property
		return widget?.token ?? "";
	}

	getHandle(widgetId: string): CapWidgetHandle {
		return this.getCommonHandle(widgetId);
	}
}
