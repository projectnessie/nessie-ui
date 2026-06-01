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

class InterpolateHtmlPlugin {
  constructor(HtmlWebpackPlugin, replacements) {
    this.HtmlWebpackPlugin = HtmlWebpackPlugin;
    this.replacements = replacements;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("InterpolateHtmlPlugin", (compilation) => {
      this.HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(
        "InterpolateHtmlPlugin",
        (data) => {
          for (const [key, value] of Object.entries(this.replacements)) {
            data.html = data.html.replace(
              new RegExp(`%${escapeRegExp(key)}%`, "g"),
              value
            );
          }
          return data;
        }
      );
    });
  }
}

class InlineChunkHtmlPlugin {
  constructor(HtmlWebpackPlugin, tests) {
    this.HtmlWebpackPlugin = HtmlWebpackPlugin;
    this.tests = tests;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("InlineChunkHtmlPlugin", (compilation) => {
      this.HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tap(
        "InlineChunkHtmlPlugin",
        (data) => {
          data.bodyTags = data.bodyTags.map((tag) => this.inlineTag(tag, compilation));
          data.headTags = data.headTags.map((tag) => this.inlineTag(tag, compilation));
          return data;
        }
      );
    });
  }

  inlineTag(tag, compilation) {
    if (
      tag.tagName !== "script" ||
      !tag.attributes ||
      !tag.attributes.src ||
      !this.tests.some((test) => test.test(tag.attributes.src))
    ) {
      return tag;
    }

    const publicPath = compilation.outputOptions.publicPath || "";
    const assetName = tag.attributes.src.replace(publicPath, "");
    const asset = compilation.assets[assetName];
    if (!asset) {
      return tag;
    }

    return {
      tagName: "script",
      voidTag: false,
      meta: tag.meta,
      attributes: {},
      innerHTML: asset.source(),
    };
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  InlineChunkHtmlPlugin,
  InterpolateHtmlPlugin,
};
