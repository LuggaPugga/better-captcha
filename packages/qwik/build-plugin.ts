import path from "node:path";
import { PROVIDER_REGISTRY, type ProviderMetadata } from "@better-captcha/core";
import {
	type FrameworkConfig,
	generateProviderAggregateModule,
	generateProviderModuleDts,
	type GeneratedFiles,
	generateAggregateIndexFile,
} from "@better-captcha/core/utils/build-plugin-utils";
import { createUnplugin } from "unplugin";

const BASE_SPEC = "@better-captcha/qwik/base";
const PROVIDER_AGG_SPEC = "@better-captcha/qwik/provider";
const PROVIDER_SPEC_PREFIX = "@better-captcha/qwik/provider/";

function toPosix(p: string): string {
	return p.split(path.sep).join("/");
}

const qwikConfig: FrameworkConfig = {
	baseImport: `import { createCaptchaComponent } from "${BASE_SPEC}";`,
	componentCreation: (providerClassName: string) =>
		`createCaptchaComponent($((identifier: string, scriptOptions?: import("@better-captcha/core").ScriptOptions) => new ${providerClassName}(identifier, scriptOptions)))`,
	componentType: "Component",
	componentTypeImports: '{ Component } from "@builder.io/qwik"',
	fileExtension: ".js",
	propsStructure: "two-params",
};

function genProviderModule(meta: ProviderMetadata, baseSpecifier = BASE_SPEC): string {
	return `import { $ } from "@builder.io/qwik";
import { createCaptchaComponent } from "${baseSpecifier}";
import { ${meta.providerClassName} } from "@better-captcha/core/providers/${meta.name}";

export const ${meta.componentName} = createCaptchaComponent(
	$((identifier, scriptOptions) => new ${meta.providerClassName}(identifier, scriptOptions)),
);
`;
}

function genProviderModuleDts(meta: ProviderMetadata): GeneratedFiles {
	return generateProviderModuleDts(meta, qwikConfig);
}

function genProviderAggregateModule(): string {
	const files = generateProviderAggregateModule(PROVIDER_REGISTRY, PROVIDER_SPEC_PREFIX);
	return files.js;
}

function genProviderAggregateModuleDts(): string {
	const files = generateAggregateIndexFile(PROVIDER_REGISTRY, ".qwik.mjs");
	return files.dts;
}

export const unplugin = createUnplugin(() => {
	const baseAbs = toPosix(path.resolve(process.cwd(), "src/base-captcha.tsx"));

	return {
		name: "better-captcha-qwik",
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

function genProviderModuleCjs(meta: ProviderMetadata): string {
	return `const { $ } = require("@builder.io/qwik");
const { createCaptchaComponent } = require("../../base-captcha.qwik.cjs");
const { ${meta.providerClassName} } = require("@better-captcha/core/providers/${meta.name}");
exports.${meta.componentName} = createCaptchaComponent($((identifier, scriptOptions) => new ${meta.providerClassName}(identifier, scriptOptions)));
`;
}

function genProviderAggregateModuleCjs(): string {
	return `${PROVIDER_REGISTRY.map(
		({ name, componentName }) =>
			`const { ${componentName} } = require("./${name}/index.qwik.cjs");\nexports.${componentName} = ${componentName};`
	).join("\n")}\n`;
}

function genIndexDts(): string {
	return `import type { CaptchaHandle, CaptchaResponse, ProviderName } from "@better-captcha/core";
import type { Component, NoSerialize, QRL, Signal } from "@builder.io/qwik";
export type { CaptchaHandle, CaptchaState, Provider, ProviderConfig, ProviderName, ScriptOptions, WidgetId } from "@better-captcha/core";

export type CaptchaSharedProps<TOptions, THandle extends CaptchaHandle<unknown> = CaptchaHandle, TSolve = string> = {
	options?: TOptions;
	class?: string;
	style?: string | Record<string, string | number>;
	onReady$?: QRL<(handle: NoSerialize<THandle>) => unknown>;
	onError$?: QRL<(error: Error) => unknown>;
	onSolve$?: QRL<(token: TSolve) => void>;
	controller?: { value: NoSerialize<THandle> | null } | null;
	autoRender?: boolean;
};

export type BetterCaptchaProps = CaptchaProps<Record<string, unknown>, CaptchaHandle<CaptchaResponse>, CaptchaResponse> & {
	provider: ProviderName;
};
export declare const BetterCaptcha: Component<BetterCaptchaProps>;

export type CaptchaProps<TOptions, THandle extends CaptchaHandle<unknown> = CaptchaHandle, TSolve = string> = CaptchaSharedProps<TOptions, THandle, TSolve> & {
	sitekey: string;
	endpoint?: never;
};
export type CaptchaPropsWithEndpoint<TOptions, THandle extends CaptchaHandle<unknown> = CaptchaHandle, TSolve = string> = CaptchaSharedProps<TOptions, THandle, TSolve> & {
	endpoint: string;
	sitekey?: never;
};

export { createCaptchaComponent, createCaptchaComponentWithEndpoint } from "./base-captcha.qwik.mjs";
export type CaptchaController<THandle extends CaptchaHandle<unknown> = CaptchaHandle> = Signal<NoSerialize<THandle> | null>;
export declare function useCaptchaController<THandle extends CaptchaHandle<unknown> = CaptchaHandle>(): CaptchaController<THandle>;
`;
}

function genBaseCaptchaDts(): string {
	const generics =
		'<TOptions = unknown, THandle extends CaptchaHandle<unknown> = CaptchaHandle, TSolve = string, TProvider extends Provider<TOptions, THandle, ReturnType<THandle["getResponse"]>, TSolve> = Provider<TOptions, THandle, ReturnType<THandle["getResponse"]>, TSolve>>';
	const factory =
		"providerFactory$: QRL<(value: string, scriptOptions?: ScriptOptions) => TProvider | Promise<TProvider>>";
	return `import type { CaptchaHandle, Provider, ScriptOptions } from "@better-captcha/core";
import type { Component, QRL } from "@builder.io/qwik";
import type { CaptchaProps, CaptchaPropsWithEndpoint } from "./index";
export declare function createCaptchaComponent${generics}(${factory}): Component<CaptchaProps<TOptions, THandle, TSolve>>;
export declare function createCaptchaComponentWithEndpoint${generics}(${factory}): Component<CaptchaPropsWithEndpoint<TOptions, THandle, TSolve>>;
`;
}

export const dtsEmitterPlugin = createUnplugin(() => {
	return {
		name: "better-captcha-dts-emitter",
		vite: {
			enforce: "post",
		},

		generateBundle() {
			this.emitFile({
				type: "asset",
				fileName: "index.d.ts",
				source: genIndexDts(),
			});

			this.emitFile({
				type: "asset",
				fileName: "base-captcha.d.ts",
				source: genBaseCaptchaDts(),
			});

			for (const provider of PROVIDER_REGISTRY) {
				this.emitFile({
					type: "asset",
					fileName: `provider/${provider.name}/index.qwik.mjs`,
					source: genProviderModule(provider, "../../base-captcha.qwik.mjs"),
				});

				this.emitFile({
					type: "asset",
					fileName: `provider/${provider.name}/index.qwik.cjs`,
					source: genProviderModuleCjs(provider),
				});

				const dtsFiles = genProviderModuleDts(provider);
				this.emitFile({
					type: "asset",
					fileName: `provider/${provider.name}/index.d.ts`,
					source: dtsFiles.dts,
				});
			}

			this.emitFile({
				type: "asset",
				fileName: "provider/index.qwik.mjs",
				source: generateAggregateIndexFile(PROVIDER_REGISTRY, ".qwik.mjs").js,
			});

			this.emitFile({
				type: "asset",
				fileName: "provider/index.qwik.cjs",
				source: genProviderAggregateModuleCjs(),
			});

			this.emitFile({
				type: "asset",
				fileName: "provider/index.d.ts",
				source: genProviderAggregateModuleDts(),
			});
		},
	};
});

export default unplugin;
