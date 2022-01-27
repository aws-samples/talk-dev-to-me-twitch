const { ModuleFederationPlugin } = require("webpack").container;
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/Catalogue",
    mode: "development",
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3002,
    },
    output: {
      publicPath: "auto",
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: "babel-loader",
          exclude: /node_modules/,
          options: {
            presets: ["@babel/preset-react"],
          },
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "imgs", to: "imgs" }
        ],
      }),
      new ModuleFederationPlugin({
        name: "Catalogue",
        filename: "remoteEntry.js",
        exposes:{
          "./Catalogue": "./src/Catalogue"
        },
        shared: {
          "@material-ui/core": {
            singleton: true,
          },
          "@material-ui/styles": {
            singleton: true
          },
          "react-router-dom": {
            singleton: true,
          },
          "react-dom": {
            singleton: true,
          },
          react: {
            singleton: true,
          },
        },
      })
    ],
  };