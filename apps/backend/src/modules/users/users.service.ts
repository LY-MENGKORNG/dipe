import { Injectable, NotFoundException } from "@nestjs/common";
import { EmailProducer } from "@modules/notifications/email.producer";
import type { CreateUserDto, ListUserQuery } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { UserRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UserRepository,
    private readonly email: EmailProducer,
  ) {}

  async create({ password, ...data }: CreateUserDto) {
    const user = await this.repository.create({
      ...data,
      password_hash: await Bun.password.hash(password),
    });

    await this.email.sendWelcome({ userId: user.id, email: user.email, name: user.name });

    return user;
  }

  findAll(query: ListUserQuery) {
    return this.repository.findMany(query);
  }

  async findOne(id: number) {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async update(id: number, { password, ...data }: UpdateUserDto) {
    return this.repository.update(id, {
      ...data,
      ...(password && { password_hash: await Bun.password.hash(password) }),
    });
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
