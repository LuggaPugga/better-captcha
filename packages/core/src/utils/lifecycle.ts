import type { CaptchaHandle, Provider, ProviderConfig, WidgetId } from "../provider";

export function cleanup<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
	TProvider extends Provider<ProviderConfig, TOptions, THandle> = Provider<ProviderConfig, TOptions, THandle>,
>(provider: TProvider | null | undefined, widgetId: WidgetId | null | undefined, element?: HTMLElement | null) {
	if (provider && widgetId != null) {
		try {
			provider.destroy(widgetId);
		} catch (error) {
			console.warn("[better-captcha] cleanup:", error);
		}
	}
	if (element) {
		element.remove();
	}
}
