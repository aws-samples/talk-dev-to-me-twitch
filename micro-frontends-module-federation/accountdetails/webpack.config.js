const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
    entry: "./src/AccountDetails",
    mode: "development",
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3005,
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
      new ModuleFederationPlugin({
        name: "AccountDetails",
        filename: "remoteEntry.js",
        exposes:{
          "./AccountDetails": "./src/AccountDetails"
        },
        shared: {
          "@material-ui/core": {
            singleton: true,
          },
          "@material-ui/styles": {
            singleton: true
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