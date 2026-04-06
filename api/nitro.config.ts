import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  compatibilityDate: "2025-01-01",
  srcDir: ".",
  devServer: {
    port: 3001,
  },
  preset: process.env.NITRO_PRESET || "node-server",
  hooks: {
    error(error) {
      console.error("[API Error]", {
        message: error.message,
        statusCode: (error as any).statusCode,
      });
    },
  },
});
