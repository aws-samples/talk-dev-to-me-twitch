const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
    entry: "./src/MyAccount",
    mode: "development",
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3004,
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
        name: "MyAccount",
        filename: "remoteEntry.js",
        exposes:{
          "./MyAccount": "./src/MyAccount"
        },
        remotes: {
          AccountDetails: "AccountDetails@http://localhost:3005/remoteEntry.js",
          PaymentDetails: "PaymentDetails@http://localhost:3006/remoteEntry.js"
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
          }
        }
      })
    ],
  };