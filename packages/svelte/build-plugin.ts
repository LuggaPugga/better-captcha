import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROVIDER_REGISTRY, type ProviderMetadata } from "@better-captcha/core";
import { generateAggregateIndexFile } from "@better-captcha/core/utils/build-plugin-utils";
import type { UnpluginFactory } from "unplugin";
import { createUnplugin } from "unplugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateProviderComponent(meta: ProviderMetadata): string {
	const {
		name,
		providerClassName,
		handleType,
		renderParamsType,
		renderParamsOmit,
		solvePayloadType,
		identifierProp = "sitekey",
	} = meta;
	const solveType = solvePayloadType ?? "string";
	const identifierPropDef = identifierProp === "endpoint" ? "endpoint: string;" : "sitekey: string;";
	const identifierBinding = identifierProp === "endpoint" ? "value={endpoint}" : "value={sitekey}";
	const propsDestructure =
		identifierProp === "endpoint" ? "{ endpoint, ...rest }: Props" : "{ sitekey, ...rest }: Props";

	return `<script lang="ts">
	import BaseCaptcha from "../../base-captcha.svelte";
	import { ${providerClassName} } from "@better-captcha/core/providers/${name}";
	import type { ${handleType}, ${renderParamsType} } from "@better-captcha/core/providers/${name}";
	import type { CaptchaState, ScriptOptions } from "@better-captcha/core";

	interface Props {
		${identifierPropDef}
		options?: Omit<${renderParamsType}, ${renderParamsOmit}>;
		scriptOptions?: ScriptOptions;
		class?: string;
		style?: string;
		autoRender?: boolean;
		onready?: (handle: ${handleType}) => void;
		onerror?: (error: Error) => void;
		onSolve?: (token: ${solveType}) => void;
	}

	let ${propsDestructure} = $props();
	let captcha = $state();

	export const execute = () => captcha?.execute() ?? Promise.resolve();
	export const reset = () => captcha?.reset();
	export const destroy = () => captcha?.destroy();
	export const getResponse = () => captcha?.getResponse();
	export const getComponentState = (): CaptchaState =>
		captcha?.getComponentState() ?? { loading: false, error: null, ready: false };
	export const render = () => captcha?.render() ?? Promise.resolve();
</script>

<BaseCaptcha bind:this={captcha} providerClass={${providerClassName}} ${identifierBinding} {...rest} />
`;
}

function generateProviderIndexJs(meta: ProviderMetadata): string {
	const { componentName } = meta;
	return `export { default, default as ${componentName} } from "./${componentName}.svelte";\n`;
}

function generateProviderDts(meta: ProviderMetadata): string {
	const {
		name,
		componentName,
		handleType,
		renderParamsType,
		renderParamsOmit,
		extraTypes,
		solvePayloadType,
		identifierProp = "sitekey",
	} = meta;

	const extraTypeImports = extraTypes.length > 0 ? `,\n\t${extraTypes.join(",\n\t")}` : "";
	const extraTypeExports = extraTypes.length > 0 ? `, ${extraTypes.join(", ")}` : "";
	const solveType = solvePayloadType ?? "string";
	const optionsType = `Omit<${renderParamsType}, ${renderParamsOmit}>`;
	const basePropsType = `CaptchaProps<${optionsType}, ${solveType}, ${handleType}>`;
	const propsType =
		identifierProp === "endpoint"
			? `Omit<${basePropsType}, "sitekey" | "endpoint"> & { endpoint: string }`
			: `Omit<${basePropsType}, "sitekey" | "endpoint"> & { sitekey: string }`;

	return `import type { SvelteComponent } from "svelte";
import type { CaptchaProps, CaptchaComponentMethods } from "../../index.js";
import type { CaptchaState } from "@better-captcha/core";
import type { ${handleType}, ${renderParamsType}${extraTypeImports} } from "@better-captcha/core/providers/${name}";

type ${componentName}Props = ${propsType};

declare class ${componentName} extends SvelteComponent<${componentName}Props> implements CaptchaComponentMethods<${handleType}> {
	execute(): Promise<void>;
	reset(): void;
	destroy(): void;
	getResponse(): ReturnType<${handleType}["getResponse"]> | undefined;
	getComponentState(): CaptchaState;
	render(): Promise<void>;
}

export default ${componentName};
export type { ${handleType}, ${renderParamsType}${extraTypeExports} };
`;
}

export const unpluginFactory: UnpluginFactory<undefined> = () => ({
	name: "better-captcha-svelte",
	rollup: {
		generateBundle() {
			this.emitFile({
				type: "asset",
				fileName: "base-captcha.svelte",
				source: fs.readFileSync(path.join(__dirname, "src/base-captcha.svelte"), "utf-8"),
			});

			this.emitFile({
				type: "asset",
				fileName: "base-captcha.svelte.d.ts",
				source: fs.readFileSync(path.join(__dirname, "src/base-captcha.svelte.d.ts"), "utf-8"),
			});

			for (const provider of PROVIDER_REGISTRY) {
				this.emitFile({
					type: "asset",
					fileName: `provider/${provider.name}/${provider.componentName}.svelte`,
					source: generateProviderComponent(provider),
				});

				this.emitFile({
					type: "asset",
					fileName: `provider/${provider.name}/index.js`,
					source: generateProviderIndexJs(provider),
				});

				this.emitFile({
					type: "asset",
					fileName: `provider/${provider.name}/index.d.ts`,
					source: generateProviderDts(provider),
				});
			}

			const aggregate = generateAggregateIndexFile(PROVIDER_REGISTRY, ".js");

			this.emitFile({
				type: "asset",
				fileName: "provider/index.js",
				source: aggregate.js,
			});

			this.emitFile({
				type: "asset",
				fileName: "provider/index.d.ts",
				source: aggregate.dts,
			});
		},
	},
});

export const unplugin = createUnplugin(unpluginFactory);
export default unplugin;
export const rollupPlugin = unplugin.rollup;
