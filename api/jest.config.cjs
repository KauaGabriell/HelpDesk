/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	roots: ["<rootDir>/tests"],
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	setupFilesAfterEnv: ["<rootDir>/tests/setup/environment.ts"],
	transform: {
		"^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.test.json" }],
	},
};
