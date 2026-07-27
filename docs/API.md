---
outline: deep
---

# API's

The middlemen of the software world. An API (Application Programming Interface) is a defined way to ask for something and get a predictable result back. That result might come from a database, but it could equally be computed on the fly, pulled from another service, read from a file or sensor, or just be the outcome of running some code. Often it sits between a UI and a database (the classic web API), but it doesn't have to, plenty of APIs have no database or UI at all.

## The Basics

Most web APIs are HTTP-based. You send a **request** to a URL (endpoint) with a **method**, and get back a **response** with a status code and (usually) a JSON body.

### HTTP Methods

| Method   | Use for                          |
| -------- | -------------------------------- |
| `GET`    | Read data (no side effects)      |
| `POST`   | Create a new resource            |
| `PUT`    | Replace an existing resource     |
| `PATCH`  | Partially update a resource      |
| `DELETE` | Remove a resource                |

### Status Codes

| Range | Meaning                                   |
| ----- | ----------------------------------------- |
| 2xx   | Success (`200 OK`, `201 Created`)         |
| 3xx   | Redirect                                  |
| 4xx   | Client error (`400`, `401`, `404`)        |
| 5xx   | Server error (`500`, `503`)               |

## Making a Request

With `curl`:

```bash
curl https://api.example.com/users/1

curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name": "Ada"}'
```

With JavaScript `fetch`:

```js
const res = await fetch("https://api.example.com/users/1");
const user = await res.json();
```

## REST vs Other Styles

- **REST** - resource-oriented, uses HTTP methods and URLs (`/users/1`). The most common style.
- **GraphQL** - a single endpoint where the client asks for exactly the fields it wants, avoiding over-fetching.
- **gRPC** - binary, high-performance, contract-first. Common for internal service-to-service calls.
- **SOAP** - XML-based messaging protocol, contract-first via a WSDL. Verbose and heavyweight compared to REST, but still common in legacy and enterprise systems (banking, payments, government).

## Authentication

- **API key** - a secret string sent in a header or query param. Simple, but coarse-grained.
- **Bearer token / JWT** - sent as `Authorization: Bearer <token>`. Common for user sessions.
- **OAuth** - delegated access ("log in with Google"), where a third party grants scoped access without sharing a password.

::: warning
Never hardcode API keys or tokens in source or commit them to git. Use environment variables or a secrets manager, and rotate anything that leaks.
:::

## Tips & Tricks

- **Read the docs first** - check the base URL, auth scheme, rate limits and pagination style before writing code.
- **Handle non-2xx responses** - `fetch` doesn't throw on `4xx`/`5xx`; check `res.ok` yourself.
- **Respect rate limits** - watch for `429 Too Many Requests` and back off, ideally honouring the `Retry-After` header.
- **Pagination** - large collections come in pages; look for `page`/`limit` params or a `next` cursor in the response.
- **Version your endpoints** - `/v1/users` lets you evolve the API without breaking existing clients.
