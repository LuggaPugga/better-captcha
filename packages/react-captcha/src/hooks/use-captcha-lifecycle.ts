import { useEffect, useRef, useState } from "react";
import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "../provider";

export function useCaptchaLifecycle<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	provider: Provider<ProviderConfig, TOptions, THandle>,
	options: TOptions | undefined,
) {
	const elementRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<WidgetId | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const [state, setState] = useState<CaptchaState>({
		loading: true,
		error: null,
		ready: false,
	});

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		let cancelled = false;
		setState({ loading: true, error: null, ready: false });

		(async () => {
			try {
				await provider.init();
				if (cancelled) return;

				// Create fresh container for each render
				const container = document.createElement("div");
				containerRef.current = container;
				element.appendChild(container);

				const id = await provider.render(container, options);
				if (cancelled) {
					if (id != null) provider.destroy(id);
					container.remove();
					return;
				}

				widgetIdRef.current = id ?? null;
				setState({ loading: false, error: null, ready: true });
			} catch (error) {
				if (!cancelled) {
					console.error("[react-captcha] render:", error);
					setState({ loading: false, error: error as Error, ready: false });
				}
			}
		})();

		return () => {
			cancelled = true;
			const id = widgetIdRef.current;
			if (id != null) {
				try {
					provider.destroy(id);
				} catch (error) {
					console.warn("[react-captcha] cleanup:", error);
				}
			}
			containerRef.current?.remove();
			widgetIdRef.current = null;
		};
	}, [provider, options]);

	return { elementRef, state, widgetIdRef, setState };
}
