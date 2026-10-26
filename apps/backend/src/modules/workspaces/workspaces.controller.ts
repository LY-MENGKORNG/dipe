import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
} from "@nestjs/swagger"
import { ZodResponse } from "nestjs-zod"
import { CurrentUser } from "@common/decorators"
import type { AuthUser } from "@common/types/auth"
import {
  AddWorkspaceMemberDto,
  CreateWorkspaceDto,
  ListWorkspaceQuery,
  ListWorkspaceResponseDto,
  UpdateWorkspaceDto,
  WorkspaceMemberListResponseDto,
  WorkspaceMemberResponseDto,
  WorkspaceResponseDto,
} from "./dto/workspace.dto"
import { WorkspacesService } from "./workspaces.service"

// docs
@ApiTags("Workspaces")
@ApiBearerAuth("bearer")
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
// ---
@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  // docs
  @ApiOperation({ summary: "Create a workspace owned by the caller" })
  @ZodResponse({ status: 201, type: WorkspaceResponseDto })
  @ApiConflictResponse({ description: "Slug already used" })
  // ---
  @Post()
  create(@Body() dto: CreateWorkspaceDto, @CurrentUser() user: AuthUser) {
    return this.workspacesService.create(dto, user)
  }

  // docs
  @ApiOperation({
    summary: "List workspaces the caller can see (public, owned, joined)",
  })
  @ZodResponse({ status: 200, type: ListWorkspaceResponseDto })
  // ---
  @Get()
  findAll(@Query() query: ListWorkspaceQuery, @CurrentUser() user: AuthUser) {
    return this.workspacesService.findAll(query, user)
  }

  // docs
  @ApiOperation({ summary: "Get one workspace" })
  @ZodResponse({ status: 200, type: WorkspaceResponseDto })
  @ApiNotFoundResponse({ description: "No visible workspace with this id" })
  // ---
  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.findOne(id, user)
  }

  // docs
  @ApiOperation({ summary: "Update a workspace (owner or admin)" })
  @ZodResponse({ status: 200, type: WorkspaceResponseDto })
  @ApiNotFoundResponse({ description: "No visible workspace with this id" })
  @ApiForbiddenResponse({ description: "Owner or admin required" })
  @ApiConflictResponse({ description: "Slug already used" })
  // ---
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.update(id, dto, user)
  }

  // docs
  @ApiOperation({
    summary: "Delete a workspace and its projects (owner or admin)",
  })
  @ZodResponse({ status: 200, type: WorkspaceResponseDto })
  @ApiNotFoundResponse({ description: "No visible workspace with this id" })
  @ApiForbiddenResponse({ description: "Owner or admin required" })
  // ---
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.workspacesService.remove(id, user)
  }

  // docs
  @ApiOperation({ summary: "List workspace members" })
  @ZodResponse({ status: 200, type: WorkspaceMemberListResponseDto })
  @ApiNotFoundResponse({ description: "No visible workspace with this id" })
  // ---
  @Get(":id/members")
  findMembers(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.findMembers(id, user)
  }

  // docs
  @ApiOperation({ summary: "Add a member (owner or admin)" })
  @ZodResponse({ status: 201, type: WorkspaceMemberResponseDto })
  @ApiNotFoundResponse({ description: "No such workspace or user" })
  @ApiForbiddenResponse({ description: "Owner or admin required" })
  @ApiConflictResponse({ description: "User is already a member" })
  // ---
  @Post(":id/members")
  addMember(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: AddWorkspaceMemberDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.addMember(id, dto, user)
  }

  // docs
  @ApiOperation({
    summary: "Remove a member (owner or admin, or the member leaving)",
  })
  @ZodResponse({ status: 200, type: WorkspaceMemberResponseDto })
  @ApiNotFoundResponse({ description: "No such workspace or membership" })
  @ApiForbiddenResponse({ description: "Owner or admin required" })
  @ApiConflictResponse({ description: "The owner cannot leave" })
  // ---
  @Delete(":id/members/:userId")
  removeMember(
    @Param("id", ParseIntPipe) id: number,
    @Param("userId", ParseIntPipe) userId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.removeMember(id, userId, user)
  }
}
