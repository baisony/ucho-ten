/** @type {import('next').NextConfig} */
const plugin = require("tailwindcss/plugin")

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
            ...(process.env.NODE_ENV === "development" ? { cssnano: {} } : {}),
        },
        plugin(function ({ addUtilities }) {
            addUtilities({
                ".contain-strict": {
                    contain: "strict",
                },
                ".contain-content": {
                    contain: "content",
                },
                ".contain-size": {
                    contain: "size",
                },
                ".contain-layout": {
                    contain: "layout",
                },
                ".contain-style": {
                    contain: "style",
                },
                ".contain-paint": {
                    contain: "paint",
                },
            })
        }),
    ],
})
