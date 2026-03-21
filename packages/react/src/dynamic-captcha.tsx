import { lazy, Suspense, useMemo } from "react";
import { PROVIDER_REGISTRY } from "@better-captcha/core/src/registry";

import { createCaptchaComponent } from "./base-captcha";

import { type ProviderConfig, type Provider } from "@better-captcha/core";
import { type CaptchaProps } from ".";

interface CaptchaComponentProps<TConfig extends ProviderConfig, TOptions = unknown, TExtraHandle extends object = Record<string, never>, TResponse = string, TSolve = TResponse> extends CaptchaProps<TOptions, TSolve> {
  provider: string | Provider<TConfig, TOptions, TExtraHandle, TResponse, TSolve>;
}

async function getDynamicCaptchaComponent(name: string) {
	const PROVIDER = PROVIDER_REGISTRY.find((p) => p.name === name);
	if (!PROVIDER) throw new Error(`Provider "${name}" is not registered.`);

	const ProviderModule = await PROVIDER.dynamicImport();
	return createCaptchaComponent(ProviderModule[PROVIDER.providerClassName]);
}

export function BetterCaptcha<
  TConfig extends ProviderConfig, 
  TOptions = unknown, 
  TExtraHandle extends object = Record<string, never>, 
  TResponse = string, TSolve = TResponse
> ({ 
  provider, 
  ...captchaProps
}: CaptchaComponentProps<TConfig, TOptions, TExtraHandle, TResponse, TSolve>) {
  const CaptchaProviderComponent = useMemo(() => {
    if (typeof provider === "string") {
      return lazy(() => getDynamicCaptchaComponent(provider).then((Component) => ({ default: Component })));
    }

    return createCaptchaComponent(provider);
  }, [provider]);

  return (
    <Suspense>
      <CaptchaProviderComponent {...captchaProps} />
    </Suspense>
  )
}