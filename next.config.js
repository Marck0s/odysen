/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Root the project explicitly: the repo lives inside the user's home
    // directory, which has its own package-lock.json (and confuses Turbopack's
    // automatic root detection).
    root: __dirname,
  },
};

module.exports = nextConfig;
