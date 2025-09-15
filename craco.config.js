// craco.config.js
const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Rename JS output
      webpackConfig.output.filename = 'static/js/myapp.js';

      // Rename CSS output
      webpackConfig.plugins.forEach((plugin) => {
        if (plugin.constructor.name === 'MiniCssExtractPlugin') {
          plugin.options.filename = 'static/css/myapp.css';
        }
      });

      return webpackConfig;
    },
  },
};
