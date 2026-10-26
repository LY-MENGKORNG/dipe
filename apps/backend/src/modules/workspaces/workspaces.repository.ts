import { Injectable } from "@nestjs/common"
import { BaseRepository } from "@common/database"
import type { Prisma } from "@config/db/generated/client"
import type { ListWorkspaceQuery } from "./dto/workspace.dto"

const memberUser = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const satisfies Prisma.UserSelect

const visibleTo = (userId: number): Prisma.WorkspaceWhereInput => ({
  OR: [
    { visibility: "PUBLIC" },
    { ownerId: userId },
    { members: { some: { userId } } },
  ],
})

@Injectable()
export class WorkspaceRepository extends BaseRepository {
  async findMany(
    { q, visibility, limit, offset }: ListWorkspaceQuery,
    viewerId?: number,
  ) {
    const where: Prisma.WorkspaceWhereInput = {
      visibility,
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        viewerId ? visibleTo(viewerId) : {},
      ],
    }

    const [data, total] = await this.transaction(() =>
      Promise.all([
        this.db.workspace.findMany({
          where,
          orderBy: { id: "asc" },
          take: limit,
          skip: offset,
        }),
        this.db.workspace.count({ where }),
      ]),
    )

    return { data, total, limit, offset }
  }

  findById(id: number) {
    return this.db.workspace.findUnique({ where: { id } })
  }

  create({
    ownerId,
    ...data
  }: Omit<Prisma.WorkspaceCreateInput, "owner"> & { ownerId: number }) {
    return this.db.workspace.create({
      data: {
        ...data,
        owner: { connect: { id: ownerId } },
        members: { create: { member: { connect: { id: ownerId } } } },
      },
    })
  }

  update(id: number, data: Prisma.WorkspaceUpdateInput) {
    return this.db.workspace.update({ where: { id }, data })
  }

  delete(id: number) {
    return this.db.workspace.delete({ where: { id } })
  }

  async isMember(workspaceId: number, userId: number) {
    const membership = await this.db.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    })
    return membership !== null
  }

  async findMembers(workspaceId: number) {
    const memberships = await this.db.workspaceMember.findMany({
      where: { workspaceId },
      include: { member: { select: memberUser } },
      orderBy: { userId: "asc" },
    })
    return memberships.map((m) => m.member)
  }

  async addMember(workspaceId: number, userId: number) {
    const { member } = await this.db.workspaceMember.create({
      data: { workspaceId, userId },
      include: { member: { select: memberUser } },
    })
    return member
  }

  async removeMember(workspaceId: number, userId: number) {
    const { member } = await this.db.workspaceMember.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
      include: { member: { select: memberUser } },
    })
    return member
  }
}
