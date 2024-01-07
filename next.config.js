/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
})
module.exports = withPWA({
    //next.js config
    reactStrictMode: false,
    plugins: [
        {
            tailwindcss: {},
            autoprefixer: {},
            cssnano: {},
        },
    ],
})
