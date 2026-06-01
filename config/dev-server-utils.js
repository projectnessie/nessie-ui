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

const net = require("net");

function clearConsole() {
  process.stdout.write("\x1Bc");
}

async function choosePort(host, defaultPort) {
  for (let port = defaultPort; port < defaultPort + 10; port += 1) {
    if (await isPortAvailable(host, port)) {
      return port;
    }
  }
  return null;
}

function isPortAvailable(host, port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ host, port }, () => {
      server.close(() => resolve(true));
    });
  });
}

function prepareUrls(protocol, host, port, pathname) {
  const prettyHost = host === "0.0.0.0" ? "localhost" : host;
  const base = `${protocol}://${prettyHost}:${port}`;
  return {
    lanUrlForConfig: host,
    localUrlForBrowser: `${base}${pathname || ""}`,
  };
}

function prepareProxy(proxy) {
  if (!proxy) {
    return undefined;
  }

  return [
    {
      context: ["/api"],
      target: proxy,
      changeOrigin: true,
      secure: false,
    },
  ];
}

module.exports = {
  choosePort,
  clearConsole,
  prepareProxy,
  prepareUrls,
};
