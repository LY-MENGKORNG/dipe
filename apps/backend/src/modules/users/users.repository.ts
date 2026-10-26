import { Injectable } from "@nestjs/common"
import { BaseRepository } from "@common/database"
import type { Prisma } from "@config/db/generated/client"
import { ListUserQuery } from "./dto/user.dto"

export const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUser }>

@Injectable()
export class UserRepository extends BaseRepository {
  async findMany({ q, role, limit, offset }: ListUserQuery) {
    const where: Prisma.UserWhereInput = {
      role,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }),
    }

    const [data, total] = await this.transaction(() =>
      Promise.all([
        this.db.user.findMany({
          where,
          omit: { passwordHash: true },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        this.db.user.count({ where }),
      ]),
    )

    return { data, total, limit, offset }
  }

  findById(id: number) {
    return this.db.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
    })
  }

  findByIdWithWorkspaces(id: number) {
    return this.db.user.findUnique({
      where: { id },
      omit: { passwordHash: true },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
        createdWorkspaces: {
          omit: { ownerId: true },
        },
      },
    })
  }

  findByEmailWithSecret(email: string) {
    return this.db.user.findUnique({ where: { email } })
  }

  create(data: Prisma.UserCreateInput) {
    return this.db.user.create({ data, omit: { passwordHash: true } })
  }

  update(id: number, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
      omit: { passwordHash: true },
    })
  }

  delete(id: number) {
    return this.db.user.delete({ where: { id }, omit: { passwordHash: true } })
  }
}
