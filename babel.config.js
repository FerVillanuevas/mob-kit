module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxImportSource: "nativewind",
          "react-compiler": {
            // Passed directly to the React Compiler Babel plugin
            compilationMode: "infer", // 'infer', 'annotation', 'syntax', or 'all'
            panicThreshold: "all_errors", // 'all_errors', 'critical_errors', or 'none'
          },
        },
      ],
      "nativewind/babel",
    ],
  };
};
