import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.simpleicons.org', 'localhost'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'static/fonts/',
        },
      },
    });
    
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash].css',
        chunkFilename: 'static/css/[id].[contenthash].css',
      })
    );
    
    return config;
  },
};

export default nextConfig;
