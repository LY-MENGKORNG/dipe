/**
Base class for all Http-specific errors. `HTTPError`, `NetworkError`, `TimeoutError`, `ResponseSizeError`, and `ForceRetryError` extend this class.

You can use `instanceof HttpClientError` to check if an error originated from Http, or use the `isHttpClientError()` type guard for cross-realm compatibility and TypeScript type narrowing.

Note: `SchemaValidationError` is intentionally not considered a Http error. `HttpClientError` covers failures in Http's HTTP lifecycle (bad status, timeout, retry), while schema validation errors originate from the user-provided schema, not from Http itself.
*/
export class HttpClientError extends Error {
  override name = 'HttpClientError'

  get isHttpClientError(): true {
    return true
  }
}
