import path from "node:path";
import { PROVIDER_REGISTRY, type ProviderMetadata } from "@better-captcha/core";
import {
	type FrameworkConfig,
	generateProviderAggregateModule,
	generateProviderAggregateModuleDts,
	generateProviderModule,
	generateProviderModuleDts,
} from "@better-captcha/core/utils/build-plugin-utils";
import { createUnplugin } from "unplugin";

const BASE_SPEC = "@better-captcha/solidjs/base";

const PROVIDER_AGG_SPEC = "@better-captcha/solidjs/provider";

const PROVIDER_SPEC_PREFIX = "@better-captcha/solidjs/provider/";

function toPosix(p: string): string {
	return p.split(path.sep).join("/");
}

const solidjsConfig: FrameworkConfig = {
	baseImport: `import { createCaptchaComponent } from "${BASE_SPEC}";`,
	componentCreation: (providerClassName: string) => `createCaptchaComponent(${providerClassName})`,
	componentType: "Component",
	componentTypeImports: '{ Component } from "solid-js"',
	fileExtension: ".js",
};

function genProviderModule(meta: ProviderMetadata): string {
	return generateProviderModule(meta, solidjsConfig);
}

function genProviderModuleDts(meta: ProviderMetadata): string {
	return generateProviderModuleDts(meta, solidjsConfig);
}

function genProviderAggregateModule(): string {
	return generateProviderAggregateModule(PROVIDER_REGISTRY, PROVIDER_SPEC_PREFIX);
}

function genProviderAggregateModuleDts(): string {
	return generateProviderAggregateModuleDts(PROVIDER_REGISTRY, ".js");
}

export const unplugin = createUnplugin(() => {
	const baseAbs = toPosix(path.resolve(process.cwd(), "src/base-captcha.tsx"));

	return {
		name: "better-captcha-solidjs",
		enforce: "pre",

		resolveId(id) {
			if (id === BASE_SPEC) return id;
			if (id === PROVIDER_AGG_SPEC) return id;
			if (id.startsWith(PROVIDER_SPEC_PREFIX)) return id;
			return null;
		},

		load(id) {
			if (id === BASE_SPEC) {
				return {
					code: `export { createCaptchaComponent } from "${baseAbs}";`,
					map: null,
				};
			}
			if (id === PROVIDER_AGG_SPEC) {
				return {
					code: genProviderAggregateModule(),
					map: null,
				};
			}
			if (id.startsWith(PROVIDER_SPEC_PREFIX)) {
				const name = id.slice(PROVIDER_SPEC_PREFIX.length);
				const meta = PROVIDER_REGISTRY.find((p) => p.name === name);
				if (!meta) return { code: "export {}", map: null };
				return {
					code: genProviderModule(meta),
					map: null,
				};
			}
			return null;
		},
	};
});

export const dtsEmitterPlugin = createUnplugin(() => {
	return {
		name: "better-captcha-dts-emitter",
		rolldown: {
			enforce: "post",

			generateBundle() {
				for (const provider of PROVIDER_REGISTRY) {
					this.emitFile({
						type: "asset",
						fileName: `provider/${provider.name}/index.d.ts`,
						source: genProviderModuleDts(provider),
					});
				}

				this.emitFile({
					type: "asset",
					fileName: "provider/index.d.ts",
					source: genProviderAggregateModuleDts(),
				});
			},
		},
	};
});

export default unplugin;
