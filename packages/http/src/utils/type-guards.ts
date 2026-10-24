import type { HttpClientError } from "../errors/HttpClientError.js";
import { HTTPError } from "../errors/HTTPError.js";
import { NetworkError } from "../errors/NetworkError.js";
import { ResponseSizeError } from "../errors/ResponseSizeError.js";
import { TimeoutError } from "../errors/TimeoutError.js";
import { ForceRetryError } from "../errors/ForceRetryError.js";

// Handles cross-realm cases (e.g., iframes, different JS contexts) where `instanceof` fails.
const isErrorType = (error: unknown, cls: { name: string }): boolean =>
  error instanceof (cls as any) ||
  ((error as any)?.isHttpClientError === true && (error as any)?.name === cls.name);

/**
Type guard to check if an error is a `HttpClientError`.

Note: `SchemaValidationError` is intentionally not considered a Http error. `HttpClientError` covers failures in Http's HTTP lifecycle (bad status, timeout, retry), while schema validation errors originate from the user-provided schema, not from Http itself.

@param error - The error to check
@returns `true` if the error is a Http error, `false` otherwise

@example
```
import {http, isHttpClientError} from '@repo/http';
try {
	const response = await http.get('/api/data');
} catch (error) {
	if (isHttpClientError(error)) {
		// Handle Http-specific errors
		console.log('Http error occurred:', error.message);
	} else {
		// Handle other errors
		console.log('Unknown error:', error);
	}
}
```
*/
export function isHttpClientError(error: unknown): error is HttpClientError {
  // Every Http error inherits this brand from `HttpClientError`, including one from another realm.
  return (error as any)?.isHttpClientError === true;
}

/**
Type guard to check if an error is an `HTTPError`.

@param error - The error to check
@returns `true` if the error is an `HTTPError`, `false` otherwise

@example
```
import {http, isHTTPError} from '@repo/http';
try {
	const response = await http.get('/api/data');
} catch (error) {
	if (isHTTPError(error)) {
		console.log('HTTP error status:', error.response.status);
	}
}
```
*/
export function isHTTPError<T = unknown>(error: unknown): error is HTTPError<T> {
  return isErrorType(error, HTTPError);
}

/**
Type guard to check if an error is a `NetworkError`.

@param error - The error to check
@returns `true` if the error is a `NetworkError`, `false` otherwise

@example
```
import {http, isNetworkError} from '@repo/http';
try {
	const response = await http.get('/api/data');
} catch (error) {
	if (isNetworkError(error)) {
		console.log('Network error:', error.request.url);
	}
}
```
*/
export function isNetworkError(error: unknown): error is NetworkError {
  return isErrorType(error, NetworkError);
}

/**
Type guard to check if an error is a `TimeoutError`.

@param error - The error to check
@returns `true` if the error is a `TimeoutError`, `false` otherwise

@example
```
import {http, isTimeoutError} from '@repo/http';
try {
	const response = await http.get('/api/data', { timeout: 1000 });
} catch (error) {
	if (isTimeoutError(error)) {
		console.log('Request timed out:', error.request.url);
	}
}
```
*/
export function isTimeoutError(error: unknown): error is TimeoutError {
  return isErrorType(error, TimeoutError);
}

/**
Type guard to check if an error is a `ForceRetryError`.

@param error - The error to check
@returns `true` if the error is a `ForceRetryError`, `false` otherwise

@example
```
import {http, isForceRetryError} from '@repo/http';

const api = http.extend({
	hooks: {
		beforeRetry: [
			({error, retryCount}) => {
				if (isForceRetryError(error)) {
					console.log(`Forced retry #${retryCount}: ${error.code}`);
				}
			}
		]
	}
});
```
*/
export function isForceRetryError(error: unknown): error is ForceRetryError {
  return isErrorType(error, ForceRetryError);
}

/**
Type guard to check if an error is a `ResponseSizeError`.

@param error - The error to check
@returns `true` if the error is a `ResponseSizeError`, `false` otherwise

@example
```
import {http, isResponseSizeError} from '@repo/http';

try {
	await http('https://example.com/data', {maxResponseSize: 1024}).json();
} catch (error) {
	if (isResponseSizeError(error)) {
		console.log(`Response exceeded ${error.maxResponseSize} bytes`);
	}
}
```
*/
export function isResponseSizeError(error: unknown): error is ResponseSizeError {
  return isErrorType(error, ResponseSizeError);
}
