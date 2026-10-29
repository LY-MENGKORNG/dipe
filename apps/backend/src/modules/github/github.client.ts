import { Injectable } from "@nestjs/common"
import { env } from "@repo/env"
import { http, type HttpInstance } from "@repo/http"
import {
  githubAuthResponseSchema,
  githubEmailsSchema,
  githubProfileSchema,
  githubUserSchema,
} from "@repo/schema"

@Injectable()
export class GithubClient {
  private readonly api: HttpInstance
  private readonly oauth: HttpInstance

  constructor() {
    this.api = http.create({
      baseUrl: "https://api.github.com",
      timeout: 3_000,
      retry: { limit: 2, backoffLimit: 2_000 },
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "dipe-api",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(env.GITHUB_TOKEN && {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        }),
      },
    })

    this.oauth = http.create({
      baseUrl: "https://github.com",
      timeout: 3_000,
      headers: {
        Accept: "application/json",
        "User-Agent": "dipe-api",
      },
    })
  }

  getUser(username: string) {
    return this.api
      .get(`/users/${encodeURIComponent(username)}`)
      .json(githubUserSchema)
  }

  getProfile(accessToken: string) {
    return this.api
      .get("/user", { headers: { Authorization: `Bearer ${accessToken}` } })
      .json(githubProfileSchema)
  }

  getEmails(accessToken: string) {
    return this.api
      .get("/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .json(githubEmailsSchema)
  }

  authorize(code: string) {
    return this.oauth
      .post("/login/oauth/access_token", {
        json: {
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          // redirect_uri: "http://localhost:5174",
          code,
        },
      })
      .json(githubAuthResponseSchema)
  }
}

/**
 * @NOTE: Common HTTP Headers
 *
 * These headers are widely used to control communication and provide additional information
 * during HTTP requests and responses.
 *
 * |++++++++++++++++++|+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|
 * |  Headers         | Purpose                                                       |
 * |++++++++++++++++++|+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|
 * |  User-Agent      | Identifies the client software making the request.            |
 * |  Accept	        | Indicates the response formats the client can handle.         |
 * |  Authorization   |	Carries authentication credentials or tokens.                 |
 * |  Content-Type    | Specifies the type of data being sent or received.            |
 * |  Host	          | Specifies the server or domain being requested.               |
 * |  Cache-Control	  | Defines caching rules for requests and responses.             |
 * |  Cookie	        | Sends stored cookie information to the server.                |
 * |  Set-Cookie	    | Sends cookies from the server to the client.                  |
 * |  Location        |	Specifies a URL for redirection or a newly created resource.  |
 * |  Content-Length  |	Indicates the size of the message body in bytes.              |
 * +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|
 */
