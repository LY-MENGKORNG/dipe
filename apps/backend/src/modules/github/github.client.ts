import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import type { Env } from "@repo/env"
import { http, type HttpInstance } from "@repo/http"
import { githubUserSchema } from "./schema/github.schema"

@Injectable()
export class GithubClient {
  private readonly http: HttpInstance

  constructor(config: ConfigService<Env, true>) {
    const token = config.get("GITHUB_TOKEN", { infer: true })

    this.http = http.create({
      baseUrl: "https://api.github.com",
      timeout: 3_000,
      retry: { limit: 2, backoffLimit: 2_000 },
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "dipe-api",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
  }

  getUser(username: string) {
    return this.http
      .get(`/users/${encodeURIComponent(username)}`)
      .json(githubUserSchema)
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
