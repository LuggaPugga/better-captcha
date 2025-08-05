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
		}>;
	}) {
		const elementRef = useRef<HTMLDivElement>(null);
		const [widgetId, setWidgetId] = useState<string | number | null>(null);
		const providerInstance = useMemo(
			() => new ProviderClass(sitekey),
			[ProviderClass, sitekey],
		);

		useImperativeHandle(ref, () => ({
			reset: () => {
				if (widgetId) providerInstance.reset(widgetId);
			},
		}));

		useEffect(() => {
			if (!elementRef.current) return;
			if (widgetId) return;

			const init = async () => {
				await providerInstance.init();
				if (elementRef.current) {
					const widgetId = await providerInstance.render(elementRef.current, {
						...options,
					});
					if (widgetId) setWidgetId(widgetId);
				}
			};

			init();
		}, [providerInstance, options, widgetId]);

		return <div ref={elementRef} />;
	};
}
