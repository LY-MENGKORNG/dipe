import { Injectable } from "@nestjs/common"
import { BaseRepository } from "@common/database"
import type { Prisma, ProjectMemberRole } from "@config/db/generated/client"
import type { ListProjectQuery } from "./dto/project.dto"

const memberView = {
  role: true,
  user: { select: { id: true, name: true, email: true } },
} as const satisfies Prisma.ProjectMemberSelect

type MemberRow = Prisma.ProjectMemberGetPayload<{ select: typeof memberView }>

const toMember = ({ role, user }: MemberRow) => ({
  userId: user.id,
  name: user.name,
  email: user.email,
  role,
})

@Injectable()
export class ProjectRepository extends BaseRepository {
  async findMany(workspaceId: number, { q, limit, offset }: ListProjectQuery) {
    const where: Prisma.ProjectWhereInput = {
      workspaceId,
      ...(q && { name: { contains: q, mode: "insensitive" } }),
    }

    const [data, total] = await this.transaction(() =>
      Promise.all([
        this.db.project.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        this.db.project.count({ where }),
      ]),
    )

    return { data, total, limit, offset }
  }

  findById(id: string) {
    return this.db.project.findUnique({
      where: { id },
      include: {
        workspace: { select: { id: true, ownerId: true, visibility: true } },
      },
    })
  }

  create(
    workspaceId: number,
    creatorId: number,
    data: Omit<Prisma.ProjectCreateInput, "workspace" | "members">,
  ) {
    return this.db.project.create({
      data: {
        ...data,
        workspace: { connect: { id: workspaceId } },
        members: {
          create: { role: "LEAD", user: { connect: { id: creatorId } } },
        },
      },
    })
  }

  update(id: string, data: Prisma.ProjectUpdateInput) {
    return this.db.project.update({ where: { id }, data })
  }

  delete(id: string) {
    return this.db.project.delete({ where: { id } })
  }

  async findMemberRole(projectId: string, memberId: number) {
    const membership = await this.db.projectMember.findUnique({
      where: { projectId_memberId: { projectId, memberId } },
      select: { role: true },
    })
    return membership?.role ?? null
  }

  async findMembers(projectId: string) {
    const rows = await this.db.projectMember.findMany({
      where: { projectId },
      select: memberView,
      orderBy: { memberId: "asc" },
    })
    return rows.map(toMember)
  }

  async addMember(
    projectId: string,
    memberId: number,
    role: ProjectMemberRole,
  ) {
    return toMember(
      await this.db.projectMember.create({
        data: { projectId, memberId, role },
        select: memberView,
      }),
    )
  }

  async removeMember(projectId: string, memberId: number) {
    return toMember(
      await this.db.projectMember.delete({
        where: { projectId_memberId: { projectId, memberId } },
        select: memberView,
      }),
    )
  }
}
