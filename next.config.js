/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
    dest: "public",
    skipWaiting: true,
    register: false,
    cacheOnFrontEndNav: true,
    reloadOnOnline: true,
    fallbacks: {
        document: "/offline",
    },
})
module.exports = withPWA({
    //next.js config
    reactStrictMode: false,
    swcMinify: true,
})
