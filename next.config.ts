import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @electric-sql/pglite's WASM internals don't survive webpack bundling —
  // let Node require it natively instead (local dev only; production uses neon-http).
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
