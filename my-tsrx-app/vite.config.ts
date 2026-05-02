import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsrxReact from "@tsrx/vite-plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [tsrxReact(), react()],
});
