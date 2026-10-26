import { createZodDto } from "nestjs-zod"
import {
  addWorkspaceMemberSchema,
  createWorkspaceSchema,
  listWorkspaceQuerySchema,
  listWorkspaceResponseSchema,
  updateWorkspaceSchema,
  workspaceMemberListSchema,
  workspaceMemberSchema,
  workspaceSchema,
} from "../schema/workspace.schema"

export class CreateWorkspaceDto extends createZodDto(createWorkspaceSchema) {}

export class UpdateWorkspaceDto extends createZodDto(updateWorkspaceSchema) {}

export class ListWorkspaceQuery extends createZodDto(
  listWorkspaceQuerySchema,
) {}

export class AddWorkspaceMemberDto extends createZodDto(
  addWorkspaceMemberSchema,
) {}

export class WorkspaceResponseDto extends createZodDto(workspaceSchema, {
  codec: true,
}) {}

export class ListWorkspaceResponseDto extends createZodDto(
  listWorkspaceResponseSchema,
  { codec: true },
) {}

export class WorkspaceMemberResponseDto extends createZodDto(
  workspaceMemberSchema,
  { codec: true },
) {}

export class WorkspaceMemberListResponseDto extends createZodDto(
  workspaceMemberListSchema,
  { codec: true },
) {}
