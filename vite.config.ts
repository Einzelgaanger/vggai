import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    cors: {
      origin: [
        "https://vggai.onrender.com",
        "http://localhost:8080",
        "http://localhost:5173",
      ],
      credentials: true,
    },
  },
  preview: {
    host: "::",
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    // Allow Render public URL
    allowedHosts: ["vggai.onrender.com"],
    cors: {
      origin: [
        "https://vggai.onrender.com",
        "http://localhost:8080",
        "http://localhost:5173",
      ],
      credentials: true,
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
