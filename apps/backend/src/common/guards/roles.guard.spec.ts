import { describe, expect, it } from "bun:test"
import { type ExecutionContext, ForbiddenException } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import type { Role } from "@config/db/generated/enums"
import { RolesGuard } from "./roles.guard"

const context = (role?: Role) =>
  ({
    getHandler: () => () => undefined,
    getClass: () => Object,
    switchToHttp: () => ({
      getRequest: () => ({ user: role && { sub: 1, email: "x", role } }),
    }),
  }) as unknown as ExecutionContext

const guardFor = (roles?: Role[]) =>
  new RolesGuard({ getAllAndOverride: () => roles } as unknown as Reflector)

describe("RolesGuard", () => {
  it("allows any authenticated user when no roles are required", () => {
    expect(guardFor().canActivate(context("employee"))).toBeTrue()
  })

  it("allows a user with a required role", () => {
    expect(guardFor(["admin"]).canActivate(context("admin"))).toBeTrue()
  })

  it("forbids a user without a required role", () => {
    expect(() => guardFor(["admin"]).canActivate(context("employee"))).toThrow(
      ForbiddenException,
    )
  })
})
