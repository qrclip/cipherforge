module.exports = function(config) {
  config.set({
    frameworks: ["jasmine", "karma-typescript"],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-typescript'),
    ],
    files: [
      { pattern: "src/**/*.ts" }
    ],
    preprocessors: {
      "**/*.ts": ["karma-typescript"]
    },
    reporters: ["dots", "karma-typescript"],
    browsers: ["ChromeHeadless"],
    singleRun: true,
  });
};
