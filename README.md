[![npm version](https://img.shields.io/npm/v/@itrocks/request-response?logo=npm)](https://www.npmjs.org/package/@itrocks/request-response)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/request-response)](https://www.npmjs.org/package/@itrocks/request-response)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/request-response?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/request-response)
[![issues](https://img.shields.io/github/issues/itrocks-ts/request-response)](https://github.com/itrocks-ts/request-response/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# request-response

Framework-agnostic module for crafting and handling HTTP requests and responses in TypeScript.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/request-response
```

## Usage

`@itrocks/request-response` provides small, focused building blocks to represent
HTTP traffic in a framework-agnostic way:

- a `Request` object that aggregates method, URL, headers, parameters,
  body data and session,
- a `Response` object that carries a body, status code and headers,
- helpers such as `assetResponse`, `mimeTypes` and `utf8Types`.

You typically adapt your framework's incoming request into a
`@itrocks/request-response` `Request`, pass it through your application
logic, then convert the resulting `Response` back into the framework's
response.

### Minimal example

```ts
import { GET, Request, Response } from '@itrocks/request-response'

// Adapter from a raw HTTP request (e.g. Node.js, Fastify, Express...) to
// @itrocks/request-response's Request
function toRequest (raw: any): Request {
	return new Request(
		GET,
		'https',
		raw.headers.host ?? 'localhost',
		443,
		raw.url,
		raw.headers as Record<string, string>,
		raw.query as Record<string, string>,
		raw.body as any,
		raw.session
	)
}

async function handleHello (rawRequest: any): Promise<Response> {
	const request = toRequest(rawRequest)

	const name = request.parameters.name ?? 'world'

	return new Response({ message: `Hello ${name}!` }, 200, {
		'content-type': 'application/json; charset=utf-8'
	})
}
```

Your HTTP server or framework-specific adapter is then responsible for
converting the `Response` instance back to an actual HTTP response.

## API

`@itrocks/request-response` exposes the following public elements:

- HTTP request primitives: `Method`, `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- The `Request<T>` class, used to represent an incoming HTTP request.
- The `RequestFile` class, used to wrap uploaded files.
- The `Response` class, used to describe an outgoing HTTP response.
- The `assetResponse` helper to build responses for static assets.
- MIME helpers: `mimeTypes` and `utf8Types`.

### HTTP methods and types

```ts
import { DELETE, GET, PATCH, POST, PUT, Method } from '@itrocks/request-response'
```

- `Method` – String union type for `"DELETE" | "GET" | "PATCH" | "POST" | "PUT"`.
- Constants `DELETE`, `GET`, `PATCH`, `POST`, `PUT` – convenient values for
  constructing a `Request`.

### `class Request<T extends object = object>`

Represents an HTTP request in a structured, type-safe way.

#### Constructor

```ts
// new Request(method, scheme, host, port, path, headers?, parameters?, data?, session?, raw?)
```

Parameters:

- `method: Method` – HTTP method.
- `scheme: string` – URL scheme (for example `"http"` or `"https"`).
- `host: string` – Host name (without scheme or port).
- `port: number` – Port number.
- `path: string` – Request path including query string.
- `headers?: Headers` – Normalised HTTP headers.
- `parameters?: Parameters` – Parsed query-string parameters.
- `data?: RecursiveValueObject` – Request body data (e.g. JSON, form data).
- `session?: Session` – Arbitrary session data associated with the request.
- `raw?: T` – Optional raw framework request object for advanced use cases.

Typical usage when adapting from a framework request:

```ts
import {
	GET,
	Request,
	type Headers,
	type Parameters,
	type RecursiveValueObject,
	type Session
} from '@itrocks/request-response'

function toRequest (raw: any): Request {
	const headers: Headers = raw.headers
	const parameters: Parameters = raw.query
	const data: RecursiveValueObject = raw.body
	const session: Session = raw.session ?? {}

	return new Request(
		GET,
		'https',
		raw.headers.host ?? 'localhost',
		443,
		raw.url,
		headers,
		parameters,
		data,
		session,
		raw
	)
}
```

#### Properties

- `method: Method` – HTTP method.
- `scheme: string` – URL scheme, e.g. `"http"` or `"https"`.
- `host: string` – Host name (without scheme or port).
- `port: number` – Port number.
- `path: string` – Request path including query string.
- `headers: Headers` – Normalised HTTP headers.
- `parameters: Parameters` – Parsed query-string parameters.
- `data: RecursiveValueObject` – Request body data (e.g. JSON, form data).
- `session: Session` – Arbitrary session data, if any.
- `raw?: T` – Optional raw framework request object for advanced use cases.

#### Getter

- `url: URL` – Convenience getter returning the fully-qualified URL
  reconstructed from `scheme`, `host`, `port` and `path`.

### `class RequestFile`

Represents an uploaded file attached to a request.

```ts
class RequestFile {
	constructor(filename: string, buffer: Buffer)
}
```

- `filename: string` – Original name of the uploaded file.
- `buffer: Buffer` – Raw file contents.

Typical usage is to expose `RequestFile` instances inside the `data`
payload for file upload handlers.

### `class Response`

Represents an HTTP response that your framework adapter can send back to
the client.

```ts
class Response {
	constructor(body?: object | string, statusCode?: number, headers?: Headers)
}
```

#### Properties

- `body: object | string` – Response payload. Can be a plain string
  (already-encoded body) or a JSON-serialisable object.
- `statusCode: number` – HTTP status code (default depends on implementation,
  usually `200`).
- `headers: Headers` – HTTP headers as a record of strings.

Example of converting a `Response` to a framework-specific reply:

```ts
async function routeHandler (rawReq: any, rawReply: any) {
	const request = toRequest(rawReq)
	const response = await handleDomainLogic(request)

	rawReply
		.status(response.statusCode)
		.headers(response.headers)
		.send(response.body)
}
```

### `assetResponse(request, filePath, mimeType)`

```ts
import { assetResponse } from '@itrocks/request-response'

const response = await assetResponse(request, '/var/www/public/logo.svg', 'image/svg+xml')
```

Builds a `Response` suitable for serving a static asset based on the
incoming `Request`:

- `request: Request` – Incoming request, used for headers and
  conditional behaviours.
- `filePath: string` – Absolute or project-relative path to the file on disk.
- `mimeType: string` – MIME type to send in the response.

This helper centralises typical asset-serving behaviour (headers,
content-type, etc.) so you don't have to repeat it.

### `mimeTypes` and `utf8Types`

```ts
import { mimeTypes, utf8Types } from '@itrocks/request-response'

const ext = 'html'
const type = mimeTypes.get(ext) ?? 'application/octet-stream'
const charset = utf8Types.has(type) ? '; charset=utf-8' : ''
```

- `mimeTypes: Map<string, string>` – Maps file extensions (without leading
  dot) to MIME types.
- `utf8Types: Set<string>` – Set of MIME types that are typically served
  with UTF‑8 encoding.

These helpers are especially convenient when implementing your own
static file server or asset pipeline.

## Typical use cases

- Building a minimal HTTP server or adapter that remains independent
  from any specific web framework.
- Sharing the same `Request` / `Response` abstractions across different
  runtime environments (Node.js, serverless, custom servers…).
- Implementing static asset handlers using `assetResponse`,
  `mimeTypes` and `utf8Types`.
- Passing `Request` instances into higher-level modules in the
  it.rocks ecosystem (for example list/new/edit actions) without tying
  them to a particular HTTP library.
