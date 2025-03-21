import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: "./"
});

// Add any custom config to be passed to Jest
const config: Config = {
	// Add more setup options before each test is run
	coverageProvider: "v8",
	testEnvironment: "jsdom",
	preset: "ts-jest",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react-dnd$": "<rootDir>/__mocks__/react-dnd.js",
    "^react-dnd-html5-backend$": "<rootDir>/__mocks__/react-dnd-html5-backend.js",
  },
	transform: {
		"^.+\\.(ts|tsx)$": ["ts-jest", {
			tsconfig: "tsconfig.json",
		}],
	},
  // react-dnd
	transformIgnorePatterns: [
		"/node_modules/(?!(react-dnd|@react-dnd|dnd-core|@react-dnd-kit|react-dnd-html5-backend)/)"
	],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);