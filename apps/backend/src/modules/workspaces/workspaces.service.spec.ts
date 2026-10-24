import { Test, TestingModule } from "@nestjs/testing"
import { WorkspacesService } from "./workspaces.service"
import { describe, beforeEach, it, expect } from "bun:test"

describe("WorkspacesService", () => {
  let service: WorkspacesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspacesService],
    }).compile()

    service = module.get<WorkspacesService>(WorkspacesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })
})
