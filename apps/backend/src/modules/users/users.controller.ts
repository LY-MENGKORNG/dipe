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
import { Roles } from "@common/decorators"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UsersService } from "./users.service"
import {
  ListUserQuery,
  UnauthorizedResponse,
  UserListResponseDto,
  UserResponseDto,
  UserWorkspacesResponseDto,
} from "./dto/user.dto"

// docs
@ApiTags("Users")
@ApiBearerAuth("bearer")
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
// ---
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // docs
  @ApiOperation({ summary: "Create a user (admin)" })
  @ApiConflictResponse({ description: "Email already used" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Post()
  @Roles(["ADMIN"])
  @ZodResponse({ status: 201, type: UserResponseDto })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  // docs
  @ApiOperation({ summary: "List users" })
  // ---
  @Get()
  @ZodResponse({ status: 200, type: UserListResponseDto })
  findAll(@Query() query: ListUserQuery) {
    return this.usersService.findAll(query)
  }

  // docs
  @ApiOperation({ summary: "Get one user" })
  @ApiNotFoundResponse({ description: "No user with this id" })
  // ---
  @Get(":id")
  @ZodResponse({ status: 200, type: UserResponseDto })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id)
  }

  // docs
  @ApiOperation({ summary: "Get one user with related workspaces" })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid bearer token",
    type: UnauthorizedResponse,
  })
  @ApiNotFoundResponse({ description: "No user with this id" })
  // ---
  @Get(":id/workspaces")
  @ZodResponse({ status: 200, type: UserWorkspacesResponseDto })
  findOneWithWorkspaces(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOneWithWorkspaces(id)
  }

  // docs
  @ApiOperation({ summary: "Update a user (admin)" })
  @ApiNotFoundResponse({ description: "No user with this id" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Patch(":id")
  @Roles(["ADMIN"])
  @ZodResponse({ status: 200, type: UserResponseDto })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  // docs
  @ApiOperation({ summary: "Delete a user (admin)" })
  @ApiNotFoundResponse({ description: "No user with this id" })
  @ApiConflictResponse({ description: "User still owns workspaces" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Delete(":id")
  @Roles(["ADMIN"])
  @ZodResponse({ status: 200, type: UserResponseDto })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id)
  }
}
