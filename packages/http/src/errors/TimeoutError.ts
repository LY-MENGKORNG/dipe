import type { HttpRequest } from '../types/request.js'
import { HttpClientError } from './HttpClientError.js'

/**
Error thrown when the request times out. It has a `request` property with the `Request` object.
*/
export class TimeoutError extends HttpClientError {
  override name = 'TimeoutError'
  request: HttpRequest

  constructor(request: Request) {
    super(`Request timed out: ${request.method} ${request.url}`)
    this.request = request
  }
}
