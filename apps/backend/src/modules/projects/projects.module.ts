import { Module } from "@nestjs/common"
import { WorkspacesModule } from "@modules/workspaces/workspaces.module"
import { ProjectsController } from "./projects.controller"
import { ProjectRepository } from "./projects.repository"
import { ProjectsService } from "./projects.service"

@Module({
  imports: [WorkspacesModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectRepository],
})
export class ProjectsModule {}
