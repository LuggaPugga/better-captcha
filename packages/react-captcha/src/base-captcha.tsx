"use client";

import {
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Provider, ProviderConfig } from "./provider";

export function createCaptchaComponent<TOptions = unknown>(
	ProviderClass: new (sitekey: string) => Provider<ProviderConfig>,
) {
	return function CaptchaComponent({
		sitekey,
		options,
		ref,
	}: {
		sitekey: string;
		options?: TOptions;
		ref?: React.RefObject<{
			reset: () => void;
			execute: () => Promise<void>;
		}>;
	}) {
		const elementRef = useRef<HTMLDivElement>(null);
		const [widgetId, setWidgetId] = useState<string | number | null>(null);
		const widgetIdRef = useRef<typeof widgetId>(widgetId);
		const providerInstance = useMemo(
			() => new ProviderClass(sitekey),
			[ProviderClass, sitekey],
		);

		useImperativeHandle(ref, () => ({
			reset: () => {
				const currentId = widgetIdRef.current;
				if (currentId !== null) providerInstance.reset(currentId);
			},
			execute: async () => {
				const currentId = widgetIdRef.current;
				if (currentId !== null) await providerInstance.execute(currentId);
			},
		}));

		useEffect(() => {
			const element = elementRef.current;
			if (!element) return;

			let cancelled = false;

			const renderCaptcha = async () => {
				try {
					await providerInstance.init();
					if (cancelled || !elementRef.current) return;

					const renderedId = await providerInstance.render(element, options);
					if (cancelled) {
						if (renderedId !== null && renderedId !== undefined) {
							providerInstance.destroy(renderedId);
						}
						return;
					}

					const resolvedId =
						renderedId !== null && renderedId !== undefined ? renderedId : null;
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
					setWidgetId(null);
				}
			};
		}, [providerInstance, options]);

		return <div id={`react-captcha-${widgetId}`} ref={elementRef} />;
	};
}
