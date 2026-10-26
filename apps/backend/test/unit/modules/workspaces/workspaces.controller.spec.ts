import { beforeEach, describe, expect, it, mock } from "bun:test"
import { Test } from "@nestjs/testing"
import type { AuthUser } from "@common/types/auth"
import { WorkspacesController } from "@modules/workspaces/workspaces.controller"
import { WorkspacesService } from "@modules/workspaces/workspaces.service"

describe("WorkspacesController", () => {
  let controller: WorkspacesController
  const service = { findAll: mock() }

  beforeEach(async () => {
    service.findAll.mockReset()

    const module = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [{ provide: WorkspacesService, useValue: service }],
    }).compile()

    controller = module.get(WorkspacesController)
  })

  it("passes the query and the current user to the service", async () => {
    const user: AuthUser = { sub: 1, email: "a@dipe.dev", role: "EMPLOYEE" }
    const query = { limit: 5, offset: 0 }

    await controller.findAll(query, user)

    expect(service.findAll).toHaveBeenCalledWith(query, user)
  })
})
