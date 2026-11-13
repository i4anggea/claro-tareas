import { defineConfig } from "vite";
// Vite inyecta CSS para HMR. La excepción existe solo en desarrollo;
// el HTML de producción conserva style-src 'self'.
export default defineConfig({
  plugins: [
    {
      name: "development-csp",
      apply: "serve",
      transformIndexHtml(html) {
        return html.replace(
          "style-src 'self'",
          "style-src 'self' 'unsafe-inline'",
        );
      },
    },
  ],
});
