import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// npm publish (used by changesets) doesn't resolve the `workspace:` protocol,
// so pin internal dependencies to the real version before publishing.
const root = resolve(import.meta.dirname, "..");
const packagesDir = resolve(root, "packages");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const packages = readdirSync(packagesDir, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => {
		const path = resolve(packagesDir, entry.name, "package.json");
		return { path, pkg: readJson(path) };
	});

const versions = new Map(packages.map(({ pkg }) => [pkg.name, pkg.version]));

for (const { path, pkg } of packages) {
	if (pkg.private) continue;
	let changed = false;
	for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
		for (const [name, range] of Object.entries(pkg[field] ?? {})) {
			if (range.startsWith("workspace:") && versions.has(name)) {
				pkg[field][name] = `^${versions.get(name)}`;
				changed = true;
			}
		}
	}
	if (changed) writeFileSync(path, `${JSON.stringify(pkg, null, "\t")}\n`);
}
