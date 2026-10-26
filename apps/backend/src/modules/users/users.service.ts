import { Injectable, NotFoundException } from "@nestjs/common"
import { EmailProducer } from "@modules/notifications/email.producer"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import { UserRepository } from "./users.repository"
import { ListUserQuery } from "./dto/user.dto"

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UserRepository,
    private readonly email: EmailProducer,
  ) {}

  async create({ password, ...data }: CreateUserDto) {
    const user = await this.repository.create({
      ...data,
      passwordHash: await Bun.password.hash(password),
    })

    await this.email.sendWelcome({
      userId: user.id,
      email: user.email,
      name: user.name,
    })

    return user
  }

  findAll(query: ListUserQuery) {
    return this.repository.findMany(query)
  }

  async findOne(id: number) {
    const user = await this.repository.findById(id)
    if (!user) throw new NotFoundException(`User #${id} not found`)
    return user
  }

  async findOneWithWorkspaces(id: number) {
    const userWithWorkspaces = await this.repository.findByIdWithWorkspaces(id)
    if (!userWithWorkspaces) {
      throw new NotFoundException(`User #${id} not found`)
    }
    return {
      ...userWithWorkspaces,
      workspaces: userWithWorkspaces.workspaces.map((m) => m.workspace),
    }
  }

  async update(id: number, { password, ...data }: UpdateUserDto) {
    return this.repository.update(id, {
      ...data,
      ...(password && { passwordHash: await Bun.password.hash(password) }),
    })
  }

  remove(id: number) {
    return this.repository.delete(id)
  }
}
