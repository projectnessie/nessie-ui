/*
 * Copyright (C) 2020 Dremio
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

const path = require("path");

const validateBoolOption = (name, value, defaultValue) => {
  if (typeof value === "undefined") {
    return defaultValue;
  }

  if (typeof value !== "boolean") {
    throw new Error(`Nessie Babel preset: '${name}' option must be a boolean.`);
  }

  return value;
};

module.exports = function (api, opts) {
  const options = opts || {};
  const env = api.env();
  const isEnvDevelopment = env === "development";
  const isEnvProduction = env === "production";
  const isEnvTest = env === "test";

  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    throw new Error(
      "Using the Nessie Babel preset requires NODE_ENV or BABEL_ENV to be " +
        `one of "development", "test", or "production". Received: ${JSON.stringify(env)}.`
    );
  }

  const useESModules = validateBoolOption(
    "useESModules",
    options.useESModules,
    isEnvDevelopment || isEnvProduction
  );
  const areHelpersEnabled = validateBoolOption(
    "helpers",
    options.helpers,
    true
  );
  const useAbsoluteRuntime = validateBoolOption(
    "absoluteRuntime",
    options.absoluteRuntime,
    true
  );

  const absoluteRuntimePath = useAbsoluteRuntime
    ? path.dirname(require.resolve("@babel/runtime/package.json"))
    : undefined;

  return {
    presets: [
      isEnvTest && [
        require("@babel/preset-env").default,
        {
          targets: {
            node: "current",
          },
        },
      ],
      (isEnvProduction || isEnvDevelopment) && [
        require("@babel/preset-env").default,
        {
          useBuiltIns: "entry",
          corejs: 3,
          exclude: ["transform-typeof-symbol"],
        },
      ],
      [
        require("@babel/preset-react").default,
        {
          development: isEnvDevelopment || isEnvTest,
          ...(options.runtime !== "automatic" ? { useBuiltIns: true } : {}),
          runtime: options.runtime || "classic",
        },
      ],
      [require("@babel/preset-typescript").default],
    ].filter(Boolean),
    plugins: [
      require("babel-plugin-macros"),
      [
        require("@babel/plugin-transform-class-properties").default,
        {
          loose: true,
        },
      ],
      [
        require("@babel/plugin-transform-private-methods").default,
        {
          loose: true,
        },
      ],
      [
        require("@babel/plugin-transform-private-property-in-object").default,
        {
          loose: true,
        },
      ],
      require("@babel/plugin-transform-numeric-separator").default,
      [
        require("@babel/plugin-transform-runtime").default,
        {
          corejs: false,
          helpers: areHelpersEnabled,
          version: require("@babel/runtime/package.json").version,
          regenerator: true,
          useESModules,
          absoluteRuntime: absoluteRuntimePath,
        },
      ],
      isEnvProduction && [
        require("babel-plugin-transform-react-remove-prop-types").default,
        {
          removeImport: true,
        },
      ],
      require("@babel/plugin-transform-optional-chaining").default,
      require("@babel/plugin-transform-nullish-coalescing-operator").default,
    ].filter(Boolean),
  };
};
