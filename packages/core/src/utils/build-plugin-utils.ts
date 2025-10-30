import { ModuleKind, Project, ScriptTarget, VariableDeclarationKind } from "ts-morph";
import type { ProviderMetadata } from "../registry.js";

export interface FrameworkConfig {
	baseImport: string;
	componentCreation: (providerClassName: string, useEndpoint?: boolean) => string;
	componentType: string;
	componentTypeImports?: string;
	fileExtension: string;
	useClientDirective?: boolean;
	propsType?: string;
	/**
	 * How to structure the component type parameters:
	 * - "single-with-ref" (React): CaptchaProps<Options> & RefAttributes<Handle>
	 * - "two-params" (SolidJS/Qwik): CaptchaProps<Options, Handle>
	 */
	propsStructure?: "single-with-ref" | "two-params";
}

function createProject(): Project {
	return new Project({
		useInMemoryFileSystem: true,
		compilerOptions: {
			target: ScriptTarget.ES2022,
			module: ModuleKind.ES2022,
			declaration: true,
			esModuleInterop: true,
			skipLibCheck: true,
		},
	});
}

export interface GeneratedFiles {
	js: string;
	dts: string;
}

export function generateProviderModule(meta: ProviderMetadata, config: FrameworkConfig): GeneratedFiles {
	const project = createProject();
	const sourceFile = project.createSourceFile("provider.ts", "", { overwrite: true });

	const baseImportMatch = config.baseImport.match(/import\s+{([^}]+)}\s+from\s+"([^"]+)"/);
	if (baseImportMatch) {
		sourceFile.addImportDeclaration({
			namedImports: baseImportMatch[1].split(",").map((s) => s.trim()),
			moduleSpecifier: baseImportMatch[2],
		});
	}

	sourceFile.addImportDeclaration({
		namedImports: [meta.providerClassName],
		moduleSpecifier: `@better-captcha/core/providers/${meta.name}`,
	});

	if (config.useClientDirective) {
		sourceFile.insertStatements(0, '"use client";');
	}

	sourceFile.addVariableStatement({
		declarationKind: VariableDeclarationKind.Const,
		isExported: true,
		declarations: [
			{
				name: meta.componentName,
				initializer: config.componentCreation(meta.providerClassName, meta.useEndpoint),
			},
		],
	});

	const emitResult = project.emitToMemory();
	const files = emitResult.getFiles();

	return {
		js: files.find((f) => f.filePath.endsWith(".js"))?.text || "",
		dts: files.find((f) => f.filePath.endsWith(".d.ts"))?.text || "",
	};
}

export function generateProviderModuleDts(meta: ProviderMetadata, config: FrameworkConfig): GeneratedFiles {
	const { name, componentName, handleType, renderParamsType, renderParamsOmit, extraTypes, useEndpoint } = meta;

	const project = createProject();
	const sourceFile = project.createSourceFile("provider.ts", "", { overwrite: true });

	if (config.componentTypeImports) {
		const match = config.componentTypeImports.match(/{([^}]+)}\s+from\s+"([^"]+)"/);
		if (match) {
			sourceFile.addImportDeclaration({
				namedImports: match[1].split(",").map((s) => s.trim()),
				moduleSpecifier: match[2],
				isTypeOnly: true,
			});
		}
	}

	const propsTypesToImport = useEndpoint ? ["CaptchaPropsWithEndpoint"] : ["CaptchaProps"];
	sourceFile.addImportDeclaration({
		namedImports: propsTypesToImport,
		moduleSpecifier: "../../index.d.ts",
		isTypeOnly: true,
	});

	const typeImports = [handleType, renderParamsType, ...extraTypes];
	sourceFile.addImportDeclaration({
		namedImports: typeImports,
		moduleSpecifier: `@better-captcha/core/providers/${name}`,
		isTypeOnly: true,
	});

	const propsTypeName = `${componentName}Props`;
	const optionsType = `Omit<${renderParamsType}, ${renderParamsOmit}>`;

	if (config.propsStructure === "two-params") {
		if (useEndpoint) {
			sourceFile.addTypeAlias({
				name: propsTypeName,
				type: `CaptchaPropsWithEndpoint<${optionsType}, ${handleType}>`,
				isExported: true,
			});
		} else {
			sourceFile.addTypeAlias({
				name: propsTypeName,
				type: `CaptchaProps<${optionsType}, ${handleType}>`,
				isExported: true,
			});
		}
	} else {
		if (useEndpoint) {
			sourceFile.addTypeAlias({
				name: propsTypeName,
				type: `CaptchaPropsWithEndpoint<${optionsType}>`,
				isExported: true,
			});
		} else {
			sourceFile.addTypeAlias({
				name: propsTypeName,
				type: `CaptchaProps<${optionsType}>`,
				isExported: true,
			});
		}
	}

	let componentTypeString: string;
	if (config.propsStructure === "single-with-ref") {
		componentTypeString = `${config.componentType}<${propsTypeName} & RefAttributes<${handleType}>>`;
	} else if (config.propsStructure === "two-params") {
		componentTypeString = `${config.componentType}<${propsTypeName}>`;
	} else {
		componentTypeString = `${config.componentType}<${propsTypeName}>`;
	}

	sourceFile.addVariableStatement({
		declarationKind: VariableDeclarationKind.Const,
		isExported: true,
		hasDeclareKeyword: true,
		declarations: [
			{
				name: componentName,
				type: componentTypeString,
			},
		],
	});

	const reExportTypes = [handleType, renderParamsType, ...extraTypes, propsTypeName];
	sourceFile.addExportDeclaration({
		namedExports: reExportTypes,
		isTypeOnly: true,
	});

	const emitResult = project.emitToMemory();
	const files = emitResult.getFiles();

	return {
		js: files.find((f) => f.filePath.endsWith(".js"))?.text || "",
		dts: files.find((f) => f.filePath.endsWith(".d.ts"))?.text || "",
	};
}

export function generateProviderAggregateModule(providers: ProviderMetadata[], prefix: string): GeneratedFiles {
	const project = createProject();
	const sourceFile = project.createSourceFile("aggregate.ts", "", { overwrite: true });

	for (const m of providers) {
		sourceFile.addExportDeclaration({
			namedExports: [m.componentName],
			moduleSpecifier: `${prefix}${m.name}`,
		});
	}

	const emitResult = project.emitToMemory();
	const files = emitResult.getFiles();

	return {
		js: files.find((f) => f.filePath.endsWith(".js"))?.text || "",
		dts: files.find((f) => f.filePath.endsWith(".d.ts"))?.text || "",
	};
}

export function generateProviderAggregateModuleDts(
	providers: ProviderMetadata[],
	fileExtension: string = ".js",
): GeneratedFiles {
	return generateAggregateIndexFile(providers, fileExtension);
}

export function generateAggregateIndexFile(
	providers: ProviderMetadata[],
	fileExtension: string = ".js",
): GeneratedFiles {
	const project = createProject();
	const sourceFile = project.createSourceFile("aggregate.ts", "", { overwrite: true });

	for (const metadata of providers) {
		const { name, componentName, handleType, renderParamsType, extraTypes } = metadata;

		sourceFile.addExportDeclaration({
			namedExports: [componentName],
			moduleSpecifier: `./${name}/index${fileExtension}`,
		});

		sourceFile.addExportDeclaration({
			namedExports: [handleType],
			moduleSpecifier: `./${name}/index${fileExtension}`,
			isTypeOnly: true,
		});

		sourceFile.addExportDeclaration({
			namedExports: [{ name: renderParamsType, alias: `${componentName}${renderParamsType}` }],
			moduleSpecifier: `./${name}/index${fileExtension}`,
			isTypeOnly: true,
		});

		for (const extraType of extraTypes) {
			sourceFile.addExportDeclaration({
				namedExports: [{ name: extraType, alias: `${componentName}${extraType}` }],
				moduleSpecifier: `./${name}/index${fileExtension}`,
				isTypeOnly: true,
			});
		}
	}

	const emitResult = project.emitToMemory();
	const files = emitResult.getFiles();

	return {
		js: files.find((f) => f.filePath.endsWith(".js"))?.text || "",
		dts: files.find((f) => f.filePath.endsWith(".d.ts"))?.text || "",
	};
}
