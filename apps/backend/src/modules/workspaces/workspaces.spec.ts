import { Test, TestingModule } from "@nestjs/testing"
import { Workspaces } from "./workspaces"

describe("Workspaces", () => {
  let provider: Workspaces

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Workspaces],
    }).compile()

    provider = module.get<Workspaces>(Workspaces)
  })

  it("should be defined", () => {
    expect(provider).toBeDefined()
  })
})
