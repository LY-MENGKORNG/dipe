import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { CurrentUser, Public } from "@common/decorators";
import type { AuthUser } from "@common/types/auth";
import { UsersService } from "@modules/users/users.service";
import { AuthService } from "./auth.service";
import { LoginDto, TokenResponseDto } from "./dto/login.dto";
import { UserResponseDto } from "@modules/users/dto/user.dto";

// docs
@ApiTags("Auth")
// ---
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  // docs
  @ApiOperation({ summary: "Exchange email + password for an access token" })
  @ApiOkResponse({ type: TokenResponseDto })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiTooManyRequestsResponse({ description: "More than 5 attempts per minute" })
  // ---
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // docs
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "The authenticated user" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  // ---
  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.users.findOne(user.sub);
  }
}
