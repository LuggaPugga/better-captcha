import { PROVIDER_REGISTRY, type ProviderMetadata } from "@better-captcha/core";
import {
	type FrameworkConfig,
	generateProviderAssets,
	generateProviderModuleDts,
} from "@better-captcha/core/utils/build-plugin-utils";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";

const reactDtsConfig: FrameworkConfig = {
	componentType: "ForwardRefExoticComponent",
	componentTypeImports: '{ ForwardRefExoticComponent, RefAttributes } from "react"',
	propsStructure: "single-with-ref",
};

function generateProviderModule(provider: ProviderMetadata) {
	return `"use client";
import { ${provider.providerClassName} } from "@better-captcha/core/providers/${provider.name}";
import { createElement, forwardRef } from "react";
import { BaseCaptcha } from "../../base-captcha.js";

export const ${provider.componentName} = forwardRef(function ${provider.componentName}(props, ref) {
\treturn createElement(BaseCaptcha, { ...props, ref, ProviderClass: ${provider.providerClassName} });
});
`;
}

export const unpluginFactory: UnpluginFactory<undefined> = () => {
	return {
		name: "better-captcha-generate-components",
		rollup: {
			generateBundle() {
				for (const asset of generateProviderAssets(PROVIDER_REGISTRY, (provider) => ({
					js: generateProviderModule(provider),
					dts: generateProviderModuleDts(provider, reactDtsConfig).dts,
				}))) {
					this.emitFile({ type: "asset", ...asset });
				}
			},
		},
	};
};

export const unplugin = createUnplugin(unpluginFactory);
export default unplugin;
export const rollupPlugin = unplugin.rollup;
