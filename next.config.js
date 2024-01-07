/** @type {import('next').NextConfig} */
const withPlugins = require("next-compose-plugins")
const TerserPlugin = require("terser-webpack-plugin")

const withTeresrPlugin = (nextConfig = {}) => {
    return {
        ...nextConfig,
        webpack(config, options) {
            if (!options.isServer) {
                config.optimization.minimizer = [
                    new TerserPlugin({
                        terserOptions: {
                            compress: {
                                drop_console: true,
                            },
                        },
                        extractComments: "all",
                    }),
                ]
            }
            if (typeof nextConfig.webpack === "function") {
                return nextConfig.webpack(config, options)
            }
            return config
        },
    }
}

const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
})

module.exports = withPlugins([withPWA, withTeresrPlugin], {
    reactStrictMode: false,
    plugins: [
        {
            tailwindcss: {},
            autoprefixer: {},
            cssnano: {},
        },
    ],
})
