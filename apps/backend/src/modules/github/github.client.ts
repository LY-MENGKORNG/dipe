import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "@repo/env";
import { http, type HttpInstance } from "@repo/http";
import { GithubUser, githubUserSchema } from "./github.schema";

@Injectable()
export class GithubClient {
  private readonly http: HttpInstance;

  constructor(config: ConfigService<Env, true>) {
    const token = config.get("GITHUB_TOKEN", { infer: true });

    this.http = http.create({
      baseUrl: "https://api.github.com/",
      timeout: 3_000,
      retry: { limit: 2, backoffLimit: 2_000 },
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "dipe-api",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }

  getUser(username: string): Promise<GithubUser> {
    return this.http.get(`users/${encodeURIComponent(username)}`).json(githubUserSchema);
  }
}
