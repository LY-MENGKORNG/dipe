import { Module } from "@nestjs/common"
import { NotificationsModule } from "@modules/notifications/notifications.module"
import { UsersController } from "./users.controller"
import { UserRepository } from "./users.repository"
import { UsersService } from "./users.service"

@Module({
  imports: [NotificationsModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
