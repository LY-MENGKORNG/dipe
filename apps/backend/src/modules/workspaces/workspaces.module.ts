import { Module } from "@nestjs/common"
import { UsersModule } from "@modules/users/users.module"
import { WorkspacesService } from "./workspaces.service"
import { WorkspacesController } from "./workspaces.controller"
import { WorkspaceRepository } from "./workspaces.repository"

@Module({
  imports: [UsersModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceRepository],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
