import { AuthInterceptor } from "./auth.interceptor"
import { describe, it, expect } from "bun:test"

describe("AuthInterceptor", () => {
  it("should be defined", () => {
    expect(new AuthInterceptor()).toBeDefined()
  })
})
