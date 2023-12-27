/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
})
const cacheHeaders = [
    {
        key: "Cache-Control",
        value: "max-age=300", // 300秒キャッシュされる
    },
]
module.exports = withPWA({
    //next.js config
    reactStrictMode: true,
    sources: "/*",
    headers: cacheHeaders,
})
