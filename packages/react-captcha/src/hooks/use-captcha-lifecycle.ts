import { useCallback, useEffect, useRef, useState } from "react";
import type {
	CaptchaState,
	Provider,
	ProviderConfig,
	CaptchaHandle,
	WidgetId,
} from "../provider";

export function useCaptchaLifecycle<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
>(
	provider: Provider<ProviderConfig, TOptions, THandle>,
	options: TOptions | undefined,
) {
	const elementRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<WidgetId | null>(null);
	const scriptLoadPromiseRef = useRef<Promise<void> | null>(null);
	const isRenderingRef = useRef(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const [state, setState] = useState<CaptchaState>({
		loading: true,
		error: null,
		ready: false,
	});

	const handleError = useCallback((error: Error, context: string) => {
		console.error(`[react-captcha] ${context}:`, error);
		setState({ loading: false, error, ready: false });
	}, []);

	useEffect(() => {
		const element = elementRef.current;
		if (!element) return;

		let cancelled = false;
		setState({ loading: true, error: null, ready: false });

		const renderCaptcha = async () => {
			try {
				if (isRenderingRef.current) return;
				isRenderingRef.current = true;

				if (!scriptLoadPromiseRef.current) {
					scriptLoadPromiseRef.current = provider.init().catch((err) => {
						scriptLoadPromiseRef.current = null;
						throw err;
					});
				}
				await scriptLoadPromiseRef.current;

				if (cancelled || !elementRef.current) return;
				// Ensure a fresh child container for every render so providers that
				// cannot re-render into the same element (e.g. reCAPTCHA) work reliably.
				if (containerRef.current && containerRef.current.parentNode) {
					containerRef.current.parentNode.removeChild(containerRef.current);
					containerRef.current = null;
				}
				const innerContainer = document.createElement("div");
				containerRef.current = innerContainer;
				element.appendChild(innerContainer);
				const id = await provider.render(innerContainer, options ?? undefined);
				if (cancelled) {
					if (id) provider.destroy(id);
					if (containerRef.current && containerRef.current.parentNode) {
						containerRef.current.parentNode.removeChild(containerRef.current);
						containerRef.current = null;
					}
					return;
				}

				widgetIdRef.current = id ?? null;
				setState({ loading: false, error: null, ready: true });
			} catch (err) {
				!cancelled && handleError(err as Error, "render");
			} finally {
				isRenderingRef.current = false;
			}
		};

		void renderCaptcha();

		return () => {
			console.log("cleanup");
			cancelled = true;
			isRenderingRef.current = false;

			const id = widgetIdRef.current;
			if (!id) return;
			try {
				provider.destroy(id);
			} catch (err) {
				console.warn("[react-captcha] cleanup:", err);
			}
			if (containerRef.current && containerRef.current.parentNode) {
				containerRef.current.parentNode.removeChild(containerRef.current);
				containerRef.current = null;
			}
			widgetIdRef.current = null;
		};
	}, [provider, options, handleError]);

	return {
		elementRef,
		state,
		widgetIdRef,
		handleError,
		setState,
	};
}
