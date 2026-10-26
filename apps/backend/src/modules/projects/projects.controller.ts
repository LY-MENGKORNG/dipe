import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { CurrentUser } from "@common/decorators"
import type { AuthUser } from "@common/types/auth"
import {
  AddProjectMemberDto,
  CreateProjectDto,
  ListProjectQuery,
  ProjectListResponseDto,
  ProjectMemberListResponseDto,
  ProjectMemberResponseDto,
  ProjectResponseDto,
  UpdateProjectDto,
} from "./dto/project.dto"
import { ProjectsService } from "./projects.service"

// docs
@ApiTags("Projects")
@ApiBearerAuth("bearer")
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
// ---
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // docs
  @ApiOperation({ summary: "Create a project in a workspace (members)" })
  @ZodResponse({ status: 201, type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: "No visible workspace with this id" })
  @ApiForbiddenResponse({ description: "Workspace membership required" })
  @ApiConflictResponse({ description: "Project name already used" })
  // ---
  @Post("workspaces/:workspaceId/projects")
  create(
    @Param("workspaceId", ParseIntPipe) workspaceId: number,
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.create(workspaceId, dto, user)
  }

  // docs
  @ApiOperation({ summary: "List projects in a workspace" })
  @ZodResponse({ status: 200, type: ProjectListResponseDto })
  @ApiNotFoundResponse({ description: "No visible workspace with this id" })
  // ---
  @Get("workspaces/:workspaceId/projects")
  findAll(
    @Param("workspaceId", ParseIntPipe) workspaceId: number,
    @Query() query: ListProjectQuery,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.findAll(workspaceId, query, user)
  }

  // docs
  @ApiOperation({ summary: "Get one project" })
  @ZodResponse({ status: 200, type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: "No visible project with this id" })
  // ---
  @Get("projects/:id")
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.findOne(id, user)
  }

  // docs
  @ApiOperation({ summary: "Update a project (project lead or manager)" })
  @ZodResponse({ status: 200, type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: "No visible project with this id" })
  @ApiForbiddenResponse({ description: "Project lead or manager required" })
  @ApiConflictResponse({ description: "Project name already used" })
  // ---
  @Patch("projects/:id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.update(id, dto, user)
  }

  // docs
  @ApiOperation({ summary: "Delete a project (project lead or manager)" })
  @ZodResponse({ status: 200, type: ProjectResponseDto })
  @ApiNotFoundResponse({ description: "No visible project with this id" })
  @ApiForbiddenResponse({ description: "Project lead or manager required" })
  // ---
  @Delete("projects/:id")
  remove(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.remove(id, user)
  }

  // docs
  @ApiOperation({ summary: "List project members" })
  @ZodResponse({ status: 200, type: ProjectMemberListResponseDto })
  @ApiNotFoundResponse({ description: "No visible project with this id" })
  // ---
  @Get("projects/:id/members")
  findMembers(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.findMembers(id, user)
  }

  // docs
  @ApiOperation({ summary: "Add a workspace member to the project" })
  @ZodResponse({ status: 201, type: ProjectMemberResponseDto })
  @ApiNotFoundResponse({ description: "No visible project with this id" })
  @ApiForbiddenResponse({ description: "Project lead or manager required" })
  @ApiConflictResponse({ description: "User is already a member" })
  @ApiUnprocessableEntityResponse({
    description: "User is not a member of the workspace",
  })
  // ---
  @Post("projects/:id/members")
  addMember(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AddProjectMemberDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.addMember(id, dto, user)
  }

  // docs
  @ApiOperation({
    summary: "Remove a project member (lead/manager, or the member leaving)",
  })
  @ZodResponse({ status: 200, type: ProjectMemberResponseDto })
  @ApiNotFoundResponse({ description: "No such project or membership" })
  @ApiForbiddenResponse({ description: "Project lead or manager required" })
  // ---
  @Delete("projects/:id/members/:userId")
  removeMember(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("userId", ParseIntPipe) userId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.projectsService.removeMember(id, userId, user)
  }
}
