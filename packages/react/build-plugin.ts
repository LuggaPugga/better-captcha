import { PROVIDER_REGISTRY } from "@better-captcha/core";
import {
	type FrameworkConfig,
	generateAggregateIndexFile,
	generateProviderModule,
	generateProviderModuleDts,
} from "@better-captcha/core/utils/build-plugin-utils";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";

const reactConfig: FrameworkConfig = {
	baseImport: `import { createCaptchaComponent } from "../../base-captcha.js";`,
	componentCreation: (providerClassName: string) => `createCaptchaComponent(${providerClassName})`,
	componentType: "ForwardRefExoticComponent",
	componentTypeImports: '{ ForwardRefExoticComponent, RefAttributes } from "react"',
	fileExtension: ".js",
	useClientDirective: true,
	propsStructure: "single-with-ref",
};

export const unpluginFactory: UnpluginFactory<undefined> = () => {
	return {
		name: "better-captcha-generate-components",
		rollup: {
			generateBundle() {
				for (const provider of PROVIDER_REGISTRY) {
					const jsFiles = generateProviderModule(provider, reactConfig);
					const dtsFiles = generateProviderModuleDts(provider, reactConfig);

					this.emitFile({
						type: "asset",
						fileName: `provider/${provider.name}/index.js`,
						source: jsFiles.js,
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
