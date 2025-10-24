import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest", // ✅ tell Jest to compile TS files

  clearMocks: true,
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // optional but safe
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

export default config;
