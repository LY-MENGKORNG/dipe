import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiGatewayTimeoutResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { GithubClient } from "./github.client";
import { GithubUserDto } from "./dto/github.dto";

// docs
@ApiTags("GitHub")
@ApiBearerAuth("bearer")
// ---
@Controller("github")
export class GithubController {
  constructor(private readonly github: GithubClient) {}

  // docs
  @ApiOperation({ summary: "Proxy a GitHub user profile" })
  @ApiOkResponse({ type: GithubUserDto })
  @ApiNotFoundResponse({ description: "No such GitHub user" })
  @ApiBadGatewayResponse({ description: "GitHub failed or returned an unexpected payload" })
  @ApiGatewayTimeoutResponse({ description: "GitHub did not answer in time" })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  // ---
  @Get("users/:username")
  getUser(@Param("username") username: string) {
    return this.github.getUser(username);
  }
}
