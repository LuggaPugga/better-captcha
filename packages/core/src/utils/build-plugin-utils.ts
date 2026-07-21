import type { ProviderMetadata } from "../registry.js";

export interface FrameworkConfig {
	baseImport: string;
	componentCreation: (providerClassName: string) => string;
	componentType: string;
	componentTypeImports?: string;
	fileExtension: string;
	useClientDirective?: boolean;
	propsStructure?: "single-with-ref" | "two-params";
	refType?: string;
}

export interface GeneratedFiles {
	js: string;
	dts: string;
}

function lines(...values: Array<string | false | undefined>): string {
	return `${values.filter(Boolean).join("\n")}\n`;
}

export function generateProviderModule(meta: ProviderMetadata, config: FrameworkConfig): GeneratedFiles {
	const { componentName, providerClassName, name } = meta;
	return {
		js: lines(
			config.useClientDirective && '"use client";',
			config.baseImport,
			`import { ${providerClassName} } from "@better-captcha/core/providers/${name}";`,
			`export const ${componentName} = ${config.componentCreation(providerClassName)};`,
		),
		dts: `export declare const ${componentName}: any;\n`,
	};
}

export function generateProviderModuleDts(meta: ProviderMetadata, config: FrameworkConfig): GeneratedFiles {
	const {
		name,
		componentName,
		handleType,
		renderParamsType,
		renderParamsOmit,
		extraTypes,
		solvePayloadType = "string",
		identifierProp = "sitekey",
	} = meta;
	const imports = [handleType, renderParamsType, ...extraTypes].join(", ");
	const optionsType = `Omit<${renderParamsType}, ${renderParamsOmit}>`;
	const basePropsType =
		config.propsStructure === "two-params"
			? `CaptchaProps<${optionsType}, ${handleType}, ${solvePayloadType}>`
			: `CaptchaProps<${optionsType}, ${solvePayloadType}>`;
	const requiredIdentifier = `{ ${identifierProp}: string }`;
	const propsType = `Omit<${basePropsType}, "sitekey" | "endpoint"> & ${requiredIdentifier}`;
	const refType =
		config.propsStructure === "single-with-ref"
			? ` & ${(config.refType ?? "RefAttributes<{handle}>").replace("{handle}", handleType)}`
			: "";

	return {
		js: "export {};\n",
		dts: lines(
			config.componentTypeImports && `import type ${config.componentTypeImports};`,
			'import type { CaptchaProps } from "../../index.d.ts";',
			`import type { ${imports} } from "@better-captcha/core/providers/${name}";`,
			`export type ${componentName}Props = ${propsType};`,
			`export declare const ${componentName}: ${config.componentType}<${componentName}Props${refType}>;`,
			`export type { ${imports} };`,
		),
	};
}

export function generateProviderAggregateModule(
	providers: readonly ProviderMetadata[],
	prefix: string,
): GeneratedFiles {
	const js = lines(
		...providers.map(({ componentName, name }) => `export { ${componentName} } from "${prefix}${name}";`),
	);
	return { js, dts: js };
}

export function generateAggregateIndexFile(
	providers: readonly ProviderMetadata[],
	fileExtension = ".js",
): GeneratedFiles {
	const js = lines(
		...providers.map(
			({ name, componentName }) => `export { ${componentName} } from "./${name}/index${fileExtension}";`,
		),
	);
	const dts = lines(
		...providers.flatMap(({ name, componentName, handleType, renderParamsType, extraTypes }) => {
			const module = `./${name}/index${fileExtension}`;
			return [
				`export { ${componentName} } from "${module}";`,
				`export type { ${handleType} } from "${module}";`,
				`export type { ${renderParamsType} as ${componentName}${renderParamsType} } from "${module}";`,
				...extraTypes.map((type) => `export type { ${type} as ${componentName}${type} } from "${module}";`),
			];
		}),
	);

	return { js, dts };
}
