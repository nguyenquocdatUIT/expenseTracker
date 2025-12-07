import { defineConfig } from "orval/dist";

export default defineConfig({
  api: {
    input: {
      target: "http://localhost:8000/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "lib/api/generated",
      schemas: "lib/api/generated/model",
      client: "react-query",
      mock: false,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "lib/api/client.ts",
          name: "customInstance",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
