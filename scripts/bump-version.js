#!/usr/bin/env bun
/**
 * Bumps version in both package.json and jsr.json to keep them in sync.
 * Usage: bun run scripts/bump-version.js <version>
 * Example: bun run scripts/bump-version.js 1.2.0
 */

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
	console.error("Usage: bun run scripts/bump-version.js <version>");
	process.exit(1);
}

for (const file of ["package.json", "jsr.json"]) {
	const path = new URL(`../${file}`, import.meta.url).pathname;
	const json = JSON.parse(await Bun.file(path).text());
	json.version = version;
	await Bun.write(path, `${JSON.stringify(json, null, 2)}\n`);
	console.log(`${file} → ${version}`);
}
