/** @type {import('next').NextConfig} */
const { withPlugins } = require("next-compose-plugins")

const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
})

const plugins = [withPWA()]
const nextConfig = {
    reactStrictMode: false,
}
module.exports = withPlugins(plugins, nextConfig)
