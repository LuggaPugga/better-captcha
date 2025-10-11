"use client";

import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import type {
	CaptchaHandle,
	Provider,
	ProviderConfig,
	WidgetId,
} from "./provider";

export function createCaptchaComponent<
	TOptions = unknown,
	THandle extends CaptchaHandle = CaptchaHandle,
>(
	ProviderClass: new (
		sitekey: string,
	) => Provider<ProviderConfig, TOptions, THandle>,
) {
	return forwardRef<THandle, { sitekey: string; options?: TOptions }>(
		function CaptchaComponent({ sitekey, options }, ref) {
			const elementRef = useRef<HTMLDivElement>(null);
			const [widgetId, setWidgetId] = useState<WidgetId | null>(null);
			const widgetIdRef = useRef<typeof widgetId>(widgetId);
			const providerInstance = useMemo(
				() => new ProviderClass(sitekey),
				[ProviderClass, sitekey],
			);
			const initPromiseRef = useRef<Promise<void> | null>(null);

			useImperativeHandle(ref, () => {
				const currentId = widgetIdRef.current;
				if (currentId === null) {
					return {
						reset: () => {},
						execute: async () => {},
						destroy: () => {},
						getResponse: () => "",
					} as THandle;
				}
				return providerInstance.getHandle(currentId);
			}, [providerInstance]);

			useEffect(() => {
				const element = elementRef.current;
				if (!element) return;

				let cancelled = false;

				const ensureProviderInit = async () => {
					if (!initPromiseRef.current) {
						initPromiseRef.current = providerInstance.init().catch((error) => {
							initPromiseRef.current = null;
							throw error;
						});
					}

					return await initPromiseRef.current;
				};

				const renderCaptcha = async () => {
					try {
						await ensureProviderInit();
						if (cancelled || !elementRef.current) return;

						const renderedId = await providerInstance.render(element, options);
						if (cancelled) {
							if (renderedId !== null && renderedId !== undefined) {
								providerInstance.destroy(renderedId);
							}
							return;
						}

						const resolvedId =
							renderedId !== null && renderedId !== undefined
								? renderedId
								: null;
						widgetIdRef.current = resolvedId;
						setWidgetId(resolvedId);
					} catch {
						if (!cancelled) {
							widgetIdRef.current = null;
							setWidgetId(null);
						}
					}
				};

				void renderCaptcha();

				return () => {
					cancelled = true;
					const currentId = widgetIdRef.current;
					if (currentId !== null) {
						providerInstance.destroy(currentId);
						widgetIdRef.current = null;
						setWidgetId((previous) =>
							previous === currentId ? null : previous,
						);
					}
				};
			}, [providerInstance, options]);

			return <div id={`react-captcha-${widgetId}`} ref={elementRef} />;
		},
	);
}
