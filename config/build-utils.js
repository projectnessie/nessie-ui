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

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const chalk = require("chalk");

function checkRequiredFiles(files) {
  const missing = files.filter((file) => !fs.existsSync(file));
  for (const file of missing) {
    console.log(chalk.red(`Required file not found: ${file}`));
  }
  return missing.length === 0;
}

function formatWebpackMessages(json) {
  const format = (message) =>
    typeof message === "string"
      ? message
      : message.message || message.details || JSON.stringify(message, null, 2);

  return {
    errors: (json.errors || []).map(format),
    warnings: (json.warnings || []).map(format),
  };
}

function printBuildError(error) {
  console.log((error && error.message) || error);
}

function getFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory).flatMap((name) => {
    const file = path.join(directory, name);
    return fs.statSync(file).isDirectory() ? getFiles(file) : [file];
  });
}

function getFileSize(file) {
  return zlib.gzipSync(fs.readFileSync(file)).length;
}

async function measureFileSizesBeforeBuild(buildFolder) {
  const sizes = {};
  for (const file of getFiles(buildFolder)) {
    sizes[file] = getFileSize(file);
  }
  return sizes;
}

function printFileSizesAfterBuild(
  stats,
  previousFileSizes,
  buildFolder,
  maxBundleGzipSize,
  maxChunkGzipSize
) {
  const assets = stats
    .toJson({ all: false, assets: true })
    .assets.filter((asset) => /\.(js|css)$/.test(asset.name))
    .sort((a, b) => b.size - a.size);

  for (const asset of assets) {
    const file = path.join(buildFolder, asset.name);
    if (!fs.existsSync(file)) {
      continue;
    }

    const size = getFileSize(file);
    const previousSize = previousFileSizes[file];
    const diff =
      previousSize === undefined
        ? ""
        : ` (${size >= previousSize ? "+" : "-"}${formatBytes(
            Math.abs(size - previousSize)
          )})`;
    const maxSize = asset.name.endsWith(".chunk.js")
      ? maxChunkGzipSize
      : maxBundleGzipSize;
    const color = size > maxSize ? chalk.yellow : chalk.green;
    console.log(`  ${color(formatBytes(size))}${diff}  ${asset.name}`);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(2)} kB`;
}

function printHostingInstructions(appPackage, publicUrl, publicPath, buildFolder) {
  console.log(`The project was built assuming it is hosted at ${publicPath}.`);
  if (publicUrl !== publicPath) {
    console.log(`The configured public URL is ${publicUrl}.`);
  }
  console.log(`The ${buildFolder} folder is ready to be deployed.`);
}

module.exports = {
  checkRequiredFiles,
  formatWebpackMessages,
  measureFileSizesBeforeBuild,
  printBuildError,
  printFileSizesAfterBuild,
  printHostingInstructions,
};
