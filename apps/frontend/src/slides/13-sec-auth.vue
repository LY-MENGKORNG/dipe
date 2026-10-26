<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Authentication vs authorization",
  section: "Security",
  notes: [
    "Authentication (authN) = who are you? Fails with 401 Unauthorized (the name is historical — it really means unauthenticated).",
    "Authorization (authZ) = are you allowed to do this? Fails with 403 Forbidden.",
    "Flow: POST /auth/login checks the password hash, signs a short-lived JWT containing the user id and role. The client sends it as `Authorization: Bearer <token>`.",
    "AuthGuard verifies the signature + expiry and attaches the user to the request. RolesGuard reads the @Roles() metadata and compares with user.role (our Role enum: EMPLOYEE, STAFF, ADMIN).",
    "Register AuthGuard globally (APP_GUARD) so endpoints are protected by default; opt out with @Public(). Secure by default beats remembering to add a decorator.",
    "The repo has an empty users.guard.ts that returns true — this is where it gets real.",
  ],
  ask: "A logged-in employee calls DELETE /users/5. 401 or 403?",
}
</script>

<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const authGuard = `
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private jwt: JwtService, private reflector: Reflector) {}

    async canActivate(ctx: ExecutionContext) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
        ctx.getHandler(), ctx.getClass(),
      ]);
      if (isPublic) return true;

      const req = ctx.switchToHttp().getRequest();
      const [type, token] = req.headers.authorization?.split(" ") ?? [];
      if (type !== "Bearer" || !token) throw new UnauthorizedException();

      try {
        req.user = await this.jwt.verifyAsync<JwtPayload>(token);
      } catch {
        throw new UnauthorizedException();          // 401
      }
      return true;
    }
  }
`

const rolesGuard = `
  export const Roles = Reflector.createDecorator<Role[]>();

  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(ctx: ExecutionContext) {
      const roles = this.reflector.get(Roles, ctx.getHandler());
      if (!roles) return true;
      const { user } = ctx.switchToHttp().getRequest();
      if (!roles.includes(user.role)) throw new ForbiddenException(); // 403
      return true;
    }
  }
`

const usage = `
  // app.module.ts — secure by default
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ]

  // users.controller.ts
  @Public()
  @Post("auth/login")
  login(@Body() dto: LoginDto) { … }        // returns { accessToken }

  @Roles(["ADMIN"])
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) { … }
`
</script>

<template>
  <SlideLayout
    section="Security"
    title="Authentication vs authorization"
    subtitle="Who are you? — then — are you allowed? Two questions, two guards, two status codes."
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div class="flex flex-col gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              Authentication <Badge variant="destructive">401</Badge>
            </CardTitle>
            <CardDescription
              >Proves identity — password → signed JWT → Bearer
              header.</CardDescription
            >
          </CardHeader>
          <CardContent class="font-mono text-xs text-muted-foreground">
            Authorization: Bearer eyJhbGciOi…
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              Authorization <Badge variant="destructive">403</Badge>
            </CardTitle>
            <CardDescription
              >Checks permission — role, ownership, plan.</CardDescription
            >
          </CardHeader>
          <CardContent class="font-mono text-xs text-muted-foreground">
            @Roles(["ADMIN"]) · user.role = "EMPLOYEE" → ✗
          </CardContent>
        </Card>
      </div>

      <Tabs default-value="auth" class="min-w-0">
        <TabsList>
          <TabsTrigger value="auth"> AuthGuard </TabsTrigger>
          <TabsTrigger value="roles"> RolesGuard </TabsTrigger>
          <TabsTrigger value="usage"> Usage </TabsTrigger>
        </TabsList>
        <TabsContent value="auth">
          <CodeSnippet
            :code="authGuard"
            title="auth.guard.ts"
            size="sm"
            :highlight="[12, 13, 16]"
          />
        </TabsContent>
        <TabsContent value="roles">
          <CodeSnippet
            :code="rolesGuard"
            title="roles.guard.ts"
            size="sm"
            :highlight="[1, 8, 11]"
          />
        </TabsContent>
        <TabsContent value="usage">
          <CodeSnippet
            :code="usage"
            title="wiring"
            size="sm"
            :highlight="[3, 4, 8, 12]"
          />
        </TabsContent>
      </Tabs>
    </div>
  </SlideLayout>
</template>
