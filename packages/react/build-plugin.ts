import { PROVIDER_REGISTRY } from "@better-captcha/core";
import {
	type FrameworkConfig,
	generateAggregateIndexFile,
	generateProviderModuleDts,
} from "@better-captcha/core/utils/build-plugin-utils";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";

const reactDtsConfig: FrameworkConfig = {
	baseImport: "",
	componentCreation: () => "",
	componentType: "ForwardRefExoticComponent",
	componentTypeImports: '{ ForwardRefExoticComponent, RefAttributes } from "react"',
	fileExtension: ".js",
	useClientDirective: true,
	propsStructure: "single-with-ref",
};

function generateProviderModule(provider: (typeof PROVIDER_REGISTRY)[number]) {
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
				for (const provider of PROVIDER_REGISTRY) {
					const js = generateProviderModule(provider);
					const dtsFiles = generateProviderModuleDts(provider, reactDtsConfig);

					this.emitFile({
						type: "asset",
						fileName: `provider/${provider.name}/index.js`,
						source: js,
					});

					this.emitFile({
						type: "asset",
						fileName: `provider/${provider.name}/index.d.ts`,
						source: dtsFiles.dts,
					});
				}

				const aggregateFiles = generateAggregateIndexFile(PROVIDER_REGISTRY, ".js");

				this.emitFile({
					type: "asset",
					fileName: "provider/index.js",
					source: aggregateFiles.js,
				});

				this.emitFile({
					type: "asset",
					fileName: "provider/index.d.ts",
					source: aggregateFiles.dts,
				});
			},
		},
	};
};

export const unplugin = createUnplugin(unpluginFactory);
export default unplugin;
export const rollupPlugin = unplugin.rollup;
