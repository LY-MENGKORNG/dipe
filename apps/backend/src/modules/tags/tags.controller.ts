import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
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
import { PostListResponseDto } from "@modules/posts/dto/posts.dto";
import { CreateTagDto, TagListResponseDto, TagResponseDto } from "./dto/tags.dto";
import { TagsService } from "./tags.service";

// docs
@ApiTags("Tags")
@ApiBearerAuth("bearer")
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
// ---
@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // docs
  @ApiOperation({ summary: "List tags with their post count" })
  @ApiOkResponse({ type: TagListResponseDto })
  // ---
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  // docs
  @ApiOperation({ summary: "Create a tag (admin)" })
  @ApiCreatedResponse({ type: TagResponseDto })
  @ApiConflictResponse({ description: "Tag name already used" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Post()
  @Roles(["admin"])
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  // docs
  @ApiOperation({ summary: "List posts with this tag" })
  @ApiOkResponse({ type: PostListResponseDto })
  @ApiNotFoundResponse({ description: "No tag with this id" })
  // ---
  @Get(":id/posts")
  findPosts(@Param("id", ParseIntPipe) id: number) {
    return this.tagsService.findPosts(id);
  }

  // docs
  @ApiOperation({ summary: "Delete a tag and detach it from every post (admin)" })
  @ApiOkResponse({ type: TagResponseDto })
  @ApiNotFoundResponse({ description: "No tag with this id" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Delete(":id")
  @Roles(["admin"])
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
