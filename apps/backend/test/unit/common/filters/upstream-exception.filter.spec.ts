import { describe, expect, it, mock } from "bun:test"
import type { ArgumentsHost } from "@nestjs/common"
import {
  HTTPError,
  SchemaValidationError,
  TimeoutError,
  type NormalizedOptions,
} from "@repo/http"
import { UpstreamExceptionFilter } from "@common/filters/upstream-exception.filter"

const request = new Request("https://api.github.com/users/octocat")

const run = (exception: Parameters<UpstreamExceptionFilter["catch"]>[0]) => {
  const send = mock((_body: Record<string, unknown>) => undefined)
  const status = mock((_code: number) => ({ send }))
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost

  new UpstreamExceptionFilter().catch(exception, host)

  return {
    status: status.mock.calls[0]?.[0],
    body: send.mock.calls[0]?.[0] ?? {},
  }
}

const httpError = (code: number) =>
  new HTTPError(
    new Response(null, { status: code }),
    request,
    {} as NormalizedOptions,
  )

describe("UpstreamExceptionFilter", () => {
  it("maps an upstream 404 to 404", () => {
    expect(run(httpError(404)).status).toBe(404)
  })

  it("maps an upstream 5xx to 502", () => {
    const { status, body } = run(httpError(503))
    expect(status).toBe(502)
    expect(body.upstream).toBe("api.github.com")
  })

  it("maps a timeout to 504", () => {
    expect(run(new TimeoutError(request)).status).toBe(504)
  })

  it("maps an unexpected payload to 502", () => {
    expect(
      run(new SchemaValidationError([{ message: "Expected string" }])).status,
    ).toBe(502)
  })
})
