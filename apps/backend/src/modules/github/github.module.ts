import { Module } from "@nestjs/common";
import { GithubClient } from "./github.client";
import { GithubController } from "./github.controller";

@Module({
  controllers: [GithubController],
  providers: [GithubClient],
})
export class GithubModule {}
