const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  watchOptions: {
    ignored: /node_modules/
  },
  performance: { hints: false },
  output: {
    filename: "game.js",
    path: path.resolve(__dirname, "public")
  }
};
