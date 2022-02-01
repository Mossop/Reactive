module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },

  ignorePatterns: ["coverage", "dist", "node_modules"],

  extends: [require.resolve("@mossop/config/node-ts/eslintrc")],
};
