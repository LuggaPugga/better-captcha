import { PROVIDER_REGISTRY, type ProviderMetadata } from "@better-captcha/core";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";
import {
	generateProviderModule,
	generateProviderModuleDts,
	generateAggregateIndexFile,
	type FrameworkConfig,
} from "@better-captcha/core/utils/build-plugin-utils";

const reactConfig: FrameworkConfig = {
	baseImport: `import { createCaptchaComponent } from "../../base-captcha.js";`,
	componentCreation: (providerClassName: string) => `createCaptchaComponent(${providerClassName})`,
	componentType: "ForwardRefExoticComponent",
	componentTypeImports: '{ ForwardRefExoticComponent, RefAttributes } from "react"',
	fileExtension: ".js",
	useClientDirective: true,
};

function generateComponentFile(metadata: ProviderMetadata): string {
	return generateProviderModule(metadata, reactConfig);
}

function generateComponentDts(metadata: ProviderMetadata): string {
	return generateProviderModuleDts(metadata, reactConfig);
}

function generateReactAggregateIndexFile(providers: ProviderMetadata[]): string {
	return generateAggregateIndexFile(providers, ".js");
}

export const unpluginFactory: UnpluginFactory<undefined> = () => {
	return {
		name: "better-captcha-generate-components",
		rollup: {
			generateBundle() {
				for (const provider of PROVIDER_REGISTRY) {
					this.emitFile({
						type: "asset",
						fileName: `provider/${provider.name}/index.js`,
						source: generateComponentFile(provider),
					});

					this.emitFile({
						type: "asset",
						fileName: `provider/${provider.name}/index.d.ts`,
						source: generateComponentDts(provider),
					});
				}

				this.emitFile({
					type: "asset",
					fileName: "provider/index.js",
					source: generateReactAggregateIndexFile(PROVIDER_REGISTRY),
				});

				this.emitFile({
					type: "asset",
					fileName: "provider/index.d.ts",
					source: generateReactAggregateIndexFile(PROVIDER_REGISTRY),
				});
			},
		},
	};
};

export const unplugin = createUnplugin(unpluginFactory);
export default unplugin;
export const rollupPlugin = unplugin.rollup;
