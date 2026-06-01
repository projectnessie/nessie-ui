/*
 * Copyright (C) 2026 Dremio
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
import { TextDecoder, TextEncoder } from "util";
import { ReadableStream, TransformStream, WritableStream } from "stream/web";
import { MessagePort } from "worker_threads";

Object.assign(globalThis, {
  MessagePort,
  ReadableStream,
  TextDecoder,
  TextEncoder,
  TransformStream,
  WritableStream,
});

// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
const undici = require("undici") as typeof import("undici");
const { fetch, FormData, Headers, Request, Response } = undici;

Object.assign(globalThis, {
  fetch,
  FormData,
  Headers,
  Request,
  Response,
});
