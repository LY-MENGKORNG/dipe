import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import type { AuthUser } from "@common/types/auth"
import type { Workspace } from "@config/db/generated/client"
import { UserRepository } from "@modules/users/users.repository"
import type {
  AddWorkspaceMemberDto,
  CreateWorkspaceDto,
  ListWorkspaceQuery,
  UpdateWorkspaceDto,
} from "./dto/workspace.dto"
import { WorkspaceRepository } from "./workspaces.repository"

type WorkspaceAccess = Pick<Workspace, "id" | "ownerId" | "visibility">

export function slugify(name: string) {
  const slug = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)

  return slug || `workspace-${Bun.randomUUIDv7().slice(-8)}`
}

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly repository: WorkspaceRepository,
    private readonly users: UserRepository,
  ) {}

  findAll(query: ListWorkspaceQuery, user: AuthUser) {
    return this.repository.findMany(
      query,
      user.role === "ADMIN" ? undefined : user.sub,
    )
  }

  async findOne(id: number, user: AuthUser) {
    const workspace = await this.repository.findById(id)
    if (!workspace || !(await this.canView(workspace, user))) {
      throw new NotFoundException(`Workspace #${id} not found`)
    }
    return workspace
  }

  create({ slug, ...dto }: CreateWorkspaceDto, user: AuthUser) {
    return this.repository.create({
      ...dto,
      slug: slug ?? slugify(dto.name),
      ownerId: user.sub,
    })
  }

  async update(id: number, dto: UpdateWorkspaceDto, user: AuthUser) {
    await this.findManageable(id, user)
    return this.repository.update(id, dto)
  }

  async remove(id: number, user: AuthUser) {
    await this.findManageable(id, user)
    return this.repository.delete(id)
  }

  async findMembers(id: number, user: AuthUser) {
    await this.findOne(id, user)
    const data = await this.repository.findMembers(id)
    return { data, total: data.length }
  }

  async addMember(
    id: number,
    { userId }: AddWorkspaceMemberDto,
    user: AuthUser,
  ) {
    await this.findManageable(id, user)
    if (!(await this.users.findById(userId))) {
      throw new NotFoundException(`User #${userId} not found`)
    }
    return this.repository.addMember(id, userId)
  }

  async removeMember(id: number, userId: number, user: AuthUser) {
    const workspace = await this.findOne(id, user)
    if (userId !== user.sub && !this.canManage(workspace, user)) {
      throw new ForbiddenException(
        "Only the workspace owner or an admin can remove other members",
      )
    }
    if (userId === workspace.ownerId) {
      throw new ConflictException("The owner cannot leave their own workspace")
    }
    return this.repository.removeMember(id, userId)
  }

  canManage(workspace: WorkspaceAccess, user: AuthUser) {
    return user.role === "ADMIN" || workspace.ownerId === user.sub
  }

  async canView(workspace: WorkspaceAccess, user: AuthUser) {
    return (
      workspace.visibility === "PUBLIC" ||
      this.canManage(workspace, user) ||
      this.repository.isMember(workspace.id, user.sub)
    )
  }

  async canContribute(workspace: WorkspaceAccess, user: AuthUser) {
    return (
      this.canManage(workspace, user) ||
      this.repository.isMember(workspace.id, user.sub)
    )
  }

  isMember(workspaceId: number, userId: number) {
    return this.repository.isMember(workspaceId, userId)
  }

  private async findManageable(id: number, user: AuthUser) {
    const workspace = await this.findOne(id, user)
    if (!this.canManage(workspace, user)) {
      throw new ForbiddenException(
        "Only the workspace owner or an admin can do this",
      )
    }
    return workspace
  }
}
