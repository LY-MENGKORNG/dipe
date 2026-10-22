import { Body, Controller, Get, Param, ParseIntPipe, Put, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { ZodResponse } from "nestjs-zod";
import { Roles } from "@common/decorators";
import { PostsService } from "./posts.service";
import {
  ListPostQuery,
  PostListResponseDto,
  PostWithRelationsResponseDto,
  ReplacePostTagsDto,
} from "./dto/posts.dto";

// docs
@ApiTags("Posts")
@ApiBearerAuth("bearer")
@ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
// ---
@Controller("posts")
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  // docs
  @ApiOperation({ summary: "List posts, optionally filtered by tag name" })
  @ZodResponse({ status: 200, type: PostListResponseDto })
  // ---
  @Get()
  getPosts(@Query() query: ListPostQuery) {
    return this.postService.findMany(query);
  }

  // docs
  @ApiOperation({ summary: "Replace the tags of a post (admin)" })
  @ZodResponse({ status: 200, type: PostWithRelationsResponseDto })
  @ApiNotFoundResponse({ description: "No post with this id, or an unknown tag id" })
  @ApiForbiddenResponse({ description: "Admin role required" })
  // ---
  @Put(":id/tags")
  @Roles(["admin"])
  replaceTags(@Param("id", ParseIntPipe) id: number, @Body() dto: ReplacePostTagsDto) {
    return this.postService.replaceTags(id, dto);
  }
}
