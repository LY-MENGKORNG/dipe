import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
import type { ConfigService } from "@nestjs/config";
import { HTTPError, SchemaValidationError } from "@repo/http";
import type { Env } from "@repo/env";
import { GithubClient } from "./github.client";

const octocat = {
  login: "octocat",
  name: "The Octocat",
  avatar_url: "https://avatars.githubusercontent.com/u/583231",
  html_url: "https://github.com/octocat",
  public_repos: 8,
  followers: 100,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("GithubClient", () => {
  let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, "fetch">>;
  const config = { get: mock(() => "test-token") } as unknown as ConfigService<Env, true>;

  beforeEach(() => {
    fetchSpy = spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  const requestAt = (call: number) => fetchSpy.mock.calls[call]![0] as Request;

  it("calls the GitHub API with auth headers and parses the profile", async () => {
    fetchSpy.mockResolvedValue(json(octocat));

    const user = await new GithubClient(config).getUser("octocat");

    expect(user).toEqual(octocat);
    expect(requestAt(0).url).toBe("https://api.github.com/users/octocat");
    expect(requestAt(0).headers.get("authorization")).toBe("Bearer test-token");
    expect(requestAt(0).headers.get("user-agent")).toBe("dipe-api");
  });

  it("retries a 503 and then succeeds", async () => {
    fetchSpy
      .mockResolvedValueOnce(json({ message: "down" }, 503))
      .mockResolvedValueOnce(json(octocat));

    const user = await new GithubClient(config).getUser("octocat");

    expect(user.login).toBe("octocat");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 404", async () => {
    fetchSpy.mockResolvedValue(json({ message: "Not Found" }, 404));

    const error = await new GithubClient(config).getUser("nobody").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HTTPError);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("rejects a payload that does not match the schema", async () => {
    fetchSpy.mockResolvedValue(json({ login: 42 }));

    const error = await new GithubClient(config).getUser("octocat").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(SchemaValidationError);
  });
});
