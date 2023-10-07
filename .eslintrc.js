module.exports = {
    extends: [
        "plugin:prettier/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    plugins: ["prettier"],
    rules: {
        "prettier/prettier": "error",
        "no-unused-vars": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/ban-ts-comment": [
            "warn",
            {
                "ts-ignore": "allow-with-description",
                minimumDescriptionLength: 15,
            },
        ],
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
    },
    env: {
        es2021: true,
        node: true,
    },
}
