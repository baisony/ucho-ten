/** @type {import('next').NextConfig} */
const withPlugins = require("next-compose-plugins")
const TerserPlugin = require("terser-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts")

const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
})

const plugins = [
    withPWA,
    new TerserPlugin({
        parallel: 4,
        terserOptions: {
            compress: {
                drop_console: true,
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
            },
            mangle: {
                safari10: true,
            },
        },
        extractComments: "all",
    }),
    new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
    }),
    new RemoveEmptyScriptsPlugin(),
]

const rules = [
    {
        test: /\.module\.scss$/,
        use: [
            MiniCssExtractPlugin.Loader,
            {
                loader: "css-loader",
            },
            {
                loader: "postcss-loader",
                options: {
                    postcssOptions: {
                        plugins: [["postcss-preset-env"]],
                    },
                },
            },
            {
                loader: "thread-loader",
                options: {
                    workerParallelJobs: 2,
                },
            },
            "sass-loader",
        ].filter(Boolean),
    },
]

module.exports = withPlugins(plugins, rules, {
    reactStrictMode: false,
    plugins: [
        {
            tailwindcss: {},
            autoprefixer: {},
            cssnano: {},
        },
    ],
    optimazation: {
        minimize: true,
        minimizer: [
            new TerserPlugin(),
            new MiniCssExtractPlugin(),
            new RemoveEmptyScriptsPlugin(),
        ],
    },
})
