import { createZodDto } from "nestjs-zod"
import {
  addProjectMemberSchema,
  createProjectSchema,
  listProjectQuerySchema,
  projectListResponseSchema,
  projectMemberListSchema,
  projectMemberSchema,
  projectResponseSchema,
  updateProjectSchema,
} from "../schema/project.schema"

export class CreateProjectDto extends createZodDto(createProjectSchema) {}

export class UpdateProjectDto extends createZodDto(updateProjectSchema) {}

export class ListProjectQuery extends createZodDto(listProjectQuerySchema) {}

export class AddProjectMemberDto extends createZodDto(addProjectMemberSchema) {}

export class ProjectResponseDto extends createZodDto(projectResponseSchema, {
  codec: true,
}) {}

export class ProjectListResponseDto extends createZodDto(
  projectListResponseSchema,
  { codec: true },
) {}

export class ProjectMemberResponseDto extends createZodDto(
  projectMemberSchema,
  { codec: true },
) {}

export class ProjectMemberListResponseDto extends createZodDto(
  projectMemberListSchema,
  { codec: true },
) {}
