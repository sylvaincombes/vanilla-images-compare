import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
        include: [
            "src/tests/**/*.spec.ts",
            "src/tests/**/*.test.ts",
            "src/tests/**/*.spec.js",
            "src/tests/**/*.test.js",
        ],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "./coverage",
        },
    },
});
