const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const AtriomPlugin = require('atriom-plugin');
const path = require("path");

module.exports = {
    entry: "./src/index",
    mode: "development",
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3001,
    },
    output: {
      publicPath: "auto",
    },
    optimization:{
        chunkIds: "named"
    },
    stats: {
      chunks: true,
      modules: false,
      chunkModules: true,
      chunkOrigins: true
    },
    // for reducing the JS files in output
    // optimization: {
    //   splitChunks: {
    //     cacheGroups: {
    //       commons: {
    //         test: /[\\/]node_modules[\\/]/,
    //         name: 'appshell_vendors',
    //         chunks: 'all'
    //       }
    //     }
    //   }
    // },
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
      // new BundleAnalyzerPlugin(), 
      new AtriomPlugin({
        filename: "atriom",
        outputPath: path.join(__dirname, "../")
      }),
      new ModuleFederationPlugin({
        // best place to understand Module Federation config https://github.com/webpack/webpack/pull/10960
        name: "AppShell",
        remotes: {
          MyAccount: "MyAccount@http://localhost:3004/remoteEntry.js",
          Catalogue: "Catalogue@http://localhost:3002/remoteEntry.js",
          SignIn: "SignIn@http://localhost:3003/remoteEntry.js"
          // SignIn: "SignIn@http://d21ugy3cbs42qx.cloudfront.net/signin/remoteEntry.js"
          
        },
        shared: {
                react: {
                    singleton: true,
                },
                "react-dom": {
                    singleton: true,
                },
                "react-router-dom": {
                    singleton: true
                },
                "@material-ui/core": {
                    singleton: true
                },
                "@material-ui/icons": {
                    singleton: true
                }
            }
        }),
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
    ],
  };  