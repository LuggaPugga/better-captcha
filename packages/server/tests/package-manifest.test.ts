import { describe, expect, it } from "vitest";
import packageJson from "../package.json";

describe("package manifest", () => {
	it("uses esm output paths that match the build artifacts", () => {
		expect(packageJson.type).toBe("module");
		expect(packageJson.main).toMatch(/\.mjs$/);
		expect(packageJson.module).toMatch(/\.mjs$/);
		expect(packageJson.types).toMatch(/\.d\.mts$/);

		const rootExport = packageJson.exports["."];
		expect(rootExport.default).toMatch(/\.mjs$/);
		expect(rootExport.types).toMatch(/\.d\.mts$/);

		const providersExport = packageJson.exports["./providers/*"];
		expect(providersExport.default).toMatch(/\.mjs$/);
		expect(providersExport.types).toMatch(/\.d\.mts$/);

		const errorsExport = packageJson.exports["./errors"];
		expect(errorsExport.default).toMatch(/\.mjs$/);
		expect(errorsExport.types).toMatch(/\.d\.mts$/);
	});
});
