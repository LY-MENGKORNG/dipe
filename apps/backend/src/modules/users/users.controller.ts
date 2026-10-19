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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Roles } from "@common/decorators";
import {
  CreateUserDto,
  ListUserQuery,
  UserListResponseDto,
  UserResponseDto,
} from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

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
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: "Email already used" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Post()
  @Roles(["admin"])
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  // docs
  @ApiOperation({ summary: "List users" })
  @ApiOkResponse({ type: UserListResponseDto })
  // ---
  @Get()
  findAll(@Query() query: ListUserQuery) {
    return this.usersService.findAll(query);
  }

  // docs
  @ApiOperation({ summary: "Get one user" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: "No user with this id" })
  // ---
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // docs
  @ApiOperation({ summary: "Update a user (admin)" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: "No user with this id" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Patch(":id")
  @Roles(["admin"])
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // docs
  @ApiOperation({ summary: "Delete a user (admin)" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({ description: "No user with this id" })
  @ApiConflictResponse({ description: "User still has posts" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Delete(":id")
  @Roles(["admin"])
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
