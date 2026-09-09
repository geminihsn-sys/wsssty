/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local SVG placeholders ship in /public/products, so no remote host is
    // required out of the box. These patterns let you swap in real photography
    // from Unsplash or your own CDN later without touching component code.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
