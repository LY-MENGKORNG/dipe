import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common"
import type { AuthUser } from "@common/types/auth"
import type { ProjectMemberRole } from "@config/db/generated/client"
import { WorkspacesService } from "@modules/workspaces/workspaces.service"
import type {
  AddProjectMemberDto,
  CreateProjectDto,
  ListProjectQuery,
  UpdateProjectDto,
} from "./dto/project.dto"
import { ProjectRepository } from "./projects.repository"

const MANAGER_ROLES: ProjectMemberRole[] = ["ADMIN", "LEAD", "MANAGER"]

@Injectable()
export class ProjectsService {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly workspaces: WorkspacesService,
  ) {}

  async findAll(workspaceId: number, query: ListProjectQuery, user: AuthUser) {
    await this.workspaces.findOne(workspaceId, user)
    return this.repository.findMany(workspaceId, query)
  }

  async create(workspaceId: number, dto: CreateProjectDto, user: AuthUser) {
    const workspace = await this.workspaces.findOne(workspaceId, user)
    if (!(await this.workspaces.canContribute(workspace, user))) {
      throw new ForbiddenException("Only workspace members can create projects")
    }
    return this.repository.create(workspaceId, user.sub, dto)
  }

  async findOne(id: string, user: AuthUser) {
    const { workspace: _, ...project } = await this.findVisible(id, user)
    return project
  }

  async update(id: string, dto: UpdateProjectDto, user: AuthUser) {
    await this.findManageable(id, user)
    return this.repository.update(id, dto)
  }

  async remove(id: string, user: AuthUser) {
    await this.findManageable(id, user)
    return this.repository.delete(id)
  }

  async findMembers(id: string, user: AuthUser) {
    await this.findVisible(id, user)
    const data = await this.repository.findMembers(id)
    return { data, total: data.length }
  }

  async addMember(
    id: string,
    { userId, role }: AddProjectMemberDto,
    user: AuthUser,
  ) {
    const project = await this.findManageable(id, user)
    if (!(await this.workspaces.isMember(project.workspaceId, userId))) {
      throw new UnprocessableEntityException(
        `User #${userId} is not a member of workspace #${project.workspaceId}`,
      )
    }
    return this.repository.addMember(id, userId, role)
  }

  async removeMember(id: string, userId: number, user: AuthUser) {
    if (userId === user.sub) await this.findVisible(id, user)
    else await this.findManageable(id, user)
    return this.repository.removeMember(id, userId)
  }

  private async findVisible(id: string, user: AuthUser) {
    const project = await this.repository.findById(id)
    if (!project || !(await this.workspaces.canView(project.workspace, user))) {
      throw new NotFoundException(`Project ${id} not found`)
    }
    return project
  }

  private async findManageable(id: string, user: AuthUser) {
    const project = await this.findVisible(id, user)
    if (this.workspaces.canManage(project.workspace, user)) return project

    const role = await this.repository.findMemberRole(id, user.sub)
    if (!role || !MANAGER_ROLES.includes(role)) {
      throw new ForbiddenException(
        "Project lead, manager, workspace owner or admin required",
      )
    }
    return project
  }
}
