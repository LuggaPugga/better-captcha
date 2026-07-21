import { PROVIDER_REGISTRY } from "@better-captcha/core";
import {
	type FrameworkConfig,
	generateProviderAssets,
	generateProviderModule,
	generateProviderModuleDts,
	type ProviderModuleConfig,
} from "@better-captcha/core/utils/build-plugin-utils";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";

const preactConfig: FrameworkConfig & ProviderModuleConfig = {
	baseImport: `import { createCaptchaComponent } from "../../base-captcha.js";`,
	componentCreation: (providerClassName: string) => `createCaptchaComponent(${providerClassName})`,
	componentType: "FunctionComponent",
	componentTypeImports: '{ Ref, FunctionComponent } from "preact"',
	propsStructure: "single-with-ref",
	refType: "{ ref?: Ref<{handle}> }",
};

export const unpluginFactory: UnpluginFactory<undefined> = () => {
	return {
		name: "better-captcha-generate-components",
		rollup: {
			generateBundle() {
				for (const asset of generateProviderAssets(PROVIDER_REGISTRY, (provider) => ({
					js: generateProviderModule(provider, preactConfig),
					dts: generateProviderModuleDts(provider, preactConfig).dts,
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
