import { beforeEach, describe, expect, it, mock } from "bun:test"
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common"
import { Test } from "@nestjs/testing"
import type { AuthUser } from "@common/types/auth"
import { WorkspacesService } from "@modules/workspaces/workspaces.service"
import { ProjectRepository } from "@modules/projects/projects.repository"
import { ProjectsService } from "@modules/projects/projects.service"

const lead: AuthUser = { sub: 1, email: "lead@dipe.dev", role: "EMPLOYEE" }
const dev: AuthUser = { sub: 2, email: "dev@dipe.dev", role: "EMPLOYEE" }

const workspace = { id: 3, ownerId: 99, visibility: "PUBLIC" as const }
const project = {
  id: "0199c0de-0000-7000-8000-000000000001",
  name: "Website",
  description: "",
  budget: 100,
  currency: "USD" as const,
  deadline: null,
  createdAt: new Date(),
  workspaceId: workspace.id,
  workspace,
}

describe("ProjectsService", () => {
  let service: ProjectsService
  const repository = {
    findMany: mock(),
    findById: mock(),
    create: mock(),
    update: mock(),
    delete: mock(),
    findMemberRole: mock(),
    findMembers: mock(),
    addMember: mock(),
    removeMember: mock(),
  }
  const workspaces = {
    findOne: mock(),
    canView: mock(),
    canManage: mock(),
    canContribute: mock(),
    isMember: mock(),
  }

  beforeEach(async () => {
    Object.values(repository).forEach((fn) => fn.mockReset())
    Object.values(workspaces).forEach((fn) => fn.mockReset())
    repository.findById.mockResolvedValue(project)
    workspaces.findOne.mockResolvedValue(workspace)
    workspaces.canView.mockResolvedValue(true)
    workspaces.canManage.mockReturnValue(false)

    const module = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectRepository, useValue: repository },
        { provide: WorkspacesService, useValue: workspaces },
      ],
    }).compile()

    service = module.get(ProjectsService)
  })

  it("makes the creator the project lead", async () => {
    workspaces.canContribute.mockResolvedValue(true)
    const dto = {
      name: "API",
      description: "",
      budget: 0,
      currency: "USD" as const,
    }

    await service.create(workspace.id, dto, dev)

    expect(repository.create).toHaveBeenCalledWith(workspace.id, dev.sub, dto)
  })

  it("forbids non-members from creating projects", async () => {
    workspaces.canContribute.mockResolvedValue(false)

    const error = await service
      .create(
        workspace.id,
        { name: "API", description: "", budget: 0, currency: "USD" },
        dev,
      )
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ForbiddenException)
  })

  it("does not leak the workspace relation in the response", async () => {
    const result = await service.findOne(project.id, dev)

    expect(result).not.toHaveProperty("workspace")
    expect(result.workspaceId).toBe(workspace.id)
  })

  it("returns 404 when the workspace is hidden from the caller", async () => {
    workspaces.canView.mockResolvedValue(false)

    const error = await service
      .findOne(project.id, dev)
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(NotFoundException)
  })

  it("lets a project LEAD update but not a DEVELOPER", async () => {
    repository.findMemberRole.mockImplementation((_id, userId: number) =>
      userId === lead.sub ? "LEAD" : "DEVELOPER",
    )

    await service.update(project.id, { budget: 200 }, lead)
    const error = await service
      .update(project.id, { budget: 1 }, dev)
      .catch((e: unknown) => e)

    expect(repository.update).toHaveBeenCalledTimes(1)
    expect(error).toBeInstanceOf(ForbiddenException)
  })

  it("only adds users who already belong to the workspace", async () => {
    repository.findMemberRole.mockResolvedValue("LEAD")
    workspaces.isMember.mockResolvedValue(false)

    const error = await service
      .addMember(project.id, { userId: 42, role: "MEMBER" }, lead)
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(UnprocessableEntityException)
    expect(repository.addMember).not.toHaveBeenCalled()
  })
})
