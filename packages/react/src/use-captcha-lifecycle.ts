import type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, WidgetId } from "@better-captcha/core";
import { cleanup as cleanupWidget } from "@better-captcha/core/utils/lifecycle";
import { useCallback, useEffect, useRef, useState } from "react";

export function useCaptchaLifecycle<TOptions = unknown, THandle extends CaptchaHandle = CaptchaHandle>(
	provider: Provider<ProviderConfig, TOptions, THandle>,
	options: TOptions | undefined,
	autoRender = true,
) {
	const elementRef = useRef<HTMLDivElement>(null);
	const widgetIdRef = useRef<WidgetId | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const lastKeyRef = useRef<string>("");
	const isRenderingRef = useRef(false);

	const [state, setState] = useState<CaptchaState>({
		loading: autoRender,
		error: null,
		ready: false,
	});

	const cleanup = useCallback(() => {
		cleanupWidget(provider, widgetIdRef.current, containerRef.current);
		widgetIdRef.current = null;
		containerRef.current = null;
	}, [provider]);

	const renderCaptcha = useCallback(async () => {
		const el = elementRef.current;
		if (!el || isRenderingRef.current) return;

		isRenderingRef.current = true;
		cleanup();
		setState({ loading: true, error: null, ready: false });

		try {
			await provider.init();

			const container = document.createElement("div");
			el.appendChild(container);
			containerRef.current = container;

			const id = await provider.render(container, options);
			widgetIdRef.current = id ?? null;

			setState({ loading: false, error: null, ready: true });
		} catch (err) {
			console.error("[better-captcha] render:", err);
			cleanup(); // remove container and reset refs
			setState({ loading: false, error: err as Error, ready: false });
		} finally {
			isRenderingRef.current = false;
		}
	}, [cleanup, provider, options]);

	useEffect(() => {
		if (!autoRender) return;
		const key = `${provider?.constructor?.name ?? "Provider"}::${JSON.stringify(options ?? null)}`;
		if (lastKeyRef.current !== key) {
			lastKeyRef.current = key;
			void renderCaptcha();
		}

		return () => {
			cleanup();
		};
	}, [autoRender, provider, options, renderCaptcha, cleanup]);

	return { elementRef, state, widgetIdRef, renderCaptcha, setState };
}
