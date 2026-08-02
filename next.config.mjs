/** @type {import('next').NextConfig} */

// When building for GitHub Pages (a project site served under /<repo>/),
// produce a fully static export and prefix all assets/routes with the repo
// base path. Netlify and local dev are unaffected — they build normally.
const isGitHubPages = process.env.GITHUB_PAGES === "true";
// Must exactly match the repo name (case-sensitive) — the project site is
// served at https://<user>.github.io/Zakariya/
const basePath = isGitHubPages ? "/Zakariya" : "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  ...(isGitHubPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        images: { unoptimized: true },
        // Exposed to the client so absolute links to /public assets resolve.
        env: { NEXT_PUBLIC_BASE_PATH: basePath },
      }
    : {}),
};

export default nextConfig;
