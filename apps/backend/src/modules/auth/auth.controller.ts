import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Redirect,
  UnauthorizedException,
} from "@nestjs/common"
import { Throttle } from "@nestjs/throttler"
import {
  ApiBearerAuth,
  ApiFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { CurrentUser, Public } from "@common/decorators"
import type { AuthUser } from "@common/types/auth"
import { UsersService } from "@modules/users/users.service"
import { AuthService } from "./auth.service"
import {
  ExchangeCodeDto,
  GithubCallbackDto,
  LoginDto,
  TokenResponseDto,
} from "./dto/login.dto"
import { UserResponseDto } from "@modules/users/dto/user.dto"

const WEB_APP_URL = "http://localhost:5174/auth/login"

// docs
@ApiTags("Auth")
// ---
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  // docs
  @ApiOperation({ summary: "Exchange email + password for an access token" })
  @ApiOkResponse({ type: TokenResponseDto })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiTooManyRequestsResponse({
    description: "More than 5 attempts per minute",
  })
  // ---
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto)
  }

  // docs
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: "The authenticated user" })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid bearer token" })
  // ---
  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.users.findOne(user.sub)
  }

  // docs
  @ApiOperation({ summary: "Authenticate with GitHub" })
  @ApiFoundResponse({
    description: "Redirects to the web app, with ?error= when login fails",
  })
  // ---
  @Public()
  @Get("callback/github")
  @Redirect(WEB_APP_URL)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async githubCallback(@Query() query: GithubCallbackDto) {
    if (!query.code) return { url: `${WEB_APP_URL}?error=missing_code` }

    try {
      const loginCode = await this.auth.createGithubLoginCode(query.code)
      return { url: `${WEB_APP_URL}?code=${loginCode}` }
    } catch (error) {
      const reason =
        error instanceof UnauthorizedException ? error.message : "login_failed"
      return { url: `${WEB_APP_URL}?error=${encodeURIComponent(reason)}` }
    }
  }

  // docs
  @ApiOperation({
    summary: "Exchange a one-time GitHub login code for a token",
  })
  @ApiOkResponse({ type: TokenResponseDto })
  @ApiUnauthorizedResponse({ description: "Invalid or expired code" })
  // ---
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("github/exchange")
  @HttpCode(HttpStatus.OK)
  exchangeGithubCode(@Body() dto: ExchangeCodeDto) {
    return this.auth.exchangeLoginCode(dto.code)
  }
}
