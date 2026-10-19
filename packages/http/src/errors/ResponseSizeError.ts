import type { HttpRequest } from '../types/request.js'
import { HttpClientError } from './HttpClientError.js'

/**
Error thrown when the response body exceeds `maxResponseSize`. It has a `request` property with the `Request` object and a `maxResponseSize` property with the configured limit in bytes.

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
export class ResponseSizeError extends HttpClientError {
  override name = 'ResponseSizeError'
  request: HttpRequest
  maxResponseSize: number

  constructor(request: Request, maxResponseSize: number) {
    super(
      `Response body exceeded ${maxResponseSize} bytes: ${request.method} ${request.url}`,
    )
    this.request = request
    this.maxResponseSize = maxResponseSize
  }
}
