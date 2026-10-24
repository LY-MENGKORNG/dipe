import { AuthMiddleware } from "./auth.middleware"
import { describe, it, expect } from "bun:test"

describe("AuthMiddleware", () => {
  it("should be defined", () => {
    expect(new AuthMiddleware()).toBeDefined()
  })
})
