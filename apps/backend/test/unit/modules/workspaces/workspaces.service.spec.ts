import { beforeEach, describe, expect, it, mock } from "bun:test"
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common"
import { Test } from "@nestjs/testing"
import type { AuthUser } from "@common/types/auth"
import { UserRepository } from "@modules/users/users.repository"
import { WorkspaceRepository } from "@modules/workspaces/workspaces.repository"
import {
  slugify,
  WorkspacesService,
} from "@modules/workspaces/workspaces.service"

const owner: AuthUser = { sub: 1, email: "owner@dipe.dev", role: "EMPLOYEE" }
const stranger: AuthUser = { sub: 2, email: "x@dipe.dev", role: "EMPLOYEE" }
const admin: AuthUser = { sub: 9, email: "admin@dipe.dev", role: "ADMIN" }

const privateWorkspace = {
  id: 7,
  name: "Secret",
  slug: "secret",
  visibility: "PRIVATE" as const,
  ownerId: owner.sub,
}

describe("WorkspacesService", () => {
  let service: WorkspacesService
  const repository = {
    findMany: mock(),
    findById: mock(),
    create: mock(),
    update: mock(),
    delete: mock(),
    isMember: mock(),
    addMember: mock(),
    removeMember: mock(),
  }
  const users = { findById: mock() }

  beforeEach(async () => {
    Object.values(repository).forEach((fn) => fn.mockReset())
    users.findById.mockReset()
    repository.isMember.mockResolvedValue(false)

    const module = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: WorkspaceRepository, useValue: repository },
        { provide: UserRepository, useValue: users },
      ],
    }).compile()

    service = module.get(WorkspacesService)
  })

  it("derives a URL-safe slug from the name", () => {
    expect(slugify("  Café Team 2026! ")).toBe("cafe-team-2026")
    expect(slugify("ក្រុម")).toStartWith("workspace-")
  })

  it("creates the workspace for the caller with a generated slug", async () => {
    repository.create.mockResolvedValue(privateWorkspace)

    await service.create({ name: "Secret Club", visibility: "PRIVATE" }, owner)

    expect(repository.create).toHaveBeenCalledWith({
      name: "Secret Club",
      slug: "secret-club",
      visibility: "PRIVATE",
      ownerId: owner.sub,
    })
  })

  it("lists everything for admins and filters by viewer otherwise", async () => {
    const query = { limit: 20, offset: 0 }

    await service.findAll(query, admin)
    await service.findAll(query, stranger)

    expect(repository.findMany.mock.calls).toEqual([
      [query, undefined],
      [query, stranger.sub],
    ])
  })

  it("hides a private workspace from non-members with 404", async () => {
    repository.findById.mockResolvedValue(privateWorkspace)

    const error = await service.findOne(7, stranger).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(NotFoundException)
  })

  it("shows a private workspace to its members", async () => {
    repository.findById.mockResolvedValue(privateWorkspace)
    repository.isMember.mockResolvedValue(true)

    expect(await service.findOne(7, stranger)).toEqual(privateWorkspace)
  })

  it("forbids members who are not the owner from updating", async () => {
    repository.findById.mockResolvedValue(privateWorkspace)
    repository.isMember.mockResolvedValue(true)

    const error = await service
      .update(7, { name: "Mine now" }, stranger)
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ForbiddenException)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it("lets an admin delete any workspace", async () => {
    repository.findById.mockResolvedValue(privateWorkspace)
    repository.delete.mockResolvedValue(privateWorkspace)

    expect(await service.remove(7, admin)).toEqual(privateWorkspace)
  })

  it("returns 404 when adding a user that does not exist", async () => {
    repository.findById.mockResolvedValue(privateWorkspace)
    users.findById.mockResolvedValue(null)

    const error = await service
      .addMember(7, { userId: 404 }, owner)
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(NotFoundException)
    expect(repository.addMember).not.toHaveBeenCalled()
  })

  it("lets a member leave but never the owner", async () => {
    repository.findById.mockResolvedValue(privateWorkspace)
    repository.isMember.mockResolvedValue(true)

    await service.removeMember(7, stranger.sub, stranger)
    const error = await service
      .removeMember(7, owner.sub, owner)
      .catch((e: unknown) => e)

    expect(repository.removeMember).toHaveBeenCalledWith(7, stranger.sub)
    expect(error).toBeInstanceOf(ConflictException)
  })
})
