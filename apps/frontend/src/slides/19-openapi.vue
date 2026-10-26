<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "API Documentation",
  section: "API Documentation",
  notes: [
    "OpenAPI is the spec (a JSON/YAML description of every route, schema and auth scheme). Swagger UI / Scalar are viewers that render it and let you send requests.",
    "Nest builds the document from code: controllers and routes come for free; DTO schemas come from nestjs-zod; descriptions and responses from @Api* decorators.",
    "This repo already has it: DocumentBuilder in docs.config.ts with a bearer scheme, rendered by Scalar at GET /docs.",
    "With nestjs-zod, run `cleanupOpenApiDoc()` on the document so Zod schemas render cleanly, and register `ZodValidationPipe` globally — otherwise the schema is documented but NOT enforced.",
    "Document responses, not just requests. @ZodResponse does it in one decorator: it documents the response AND strips the return value down to the schema (ZodSerializerInterceptor). Errors still use @ApiNotFoundResponse, @ApiUnauthorizedResponse.",
    "Why strip? A Prisma row can carry passwordHash. The response schema is an allow-list: anything not in it never leaves the server.",
    "Dates: Prisma returns Date, JSON wants a string. The isoDate codec encodes Date → ISO string on the way out, and the docs still say string/date-time.",
    "If a response does not match its schema, the client gets a plain 500 and SerializationExceptionFilter logs the route plus the exact Zod issues. Demo: change name to z.number() in users.schema.ts and call GET /api/users/1.",
    "Demo: open /docs, click Authorize, paste the token from /auth/login, call GET /api/users — that is testing endpoints through the UI.",
  ],
}
</script>

<script setup lang="ts">
import { ArrowRight } from "@lucide/vue"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const flow = [
  "Zod DTOs",
  "@ZodResponse + @Api*",
  "DocumentBuilder",
  "openapi.json",
  "Scalar at /docs",
]

const tabs = [
  {
    value: "builder",
    label: "docs.config.ts",
    title: "src/config/docs.config.ts (repo + cleanupOpenApiDoc)",
    highlight: [5, 6, 11],
    code: `
      const config = new DocumentBuilder()
        .setTitle("DIPE API Documentation")
        .setDescription("DIPE API Documentation")
        .setVersion("0.1.0")
        .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "bearer")
        .addSecurityRequirements("bearer")
        .build();

      export function apiReference<T>(app: INestApplication<T>) {
        return reference({
          content: () => cleanupOpenApiDoc(SwaggerModule.createDocument(app, config)),
          theme: "saturn",
          withFastify: true,
        });
      }
    `,
  },
  {
    value: "dto",
    label: "Zod DTO",
    title: "users/dto/create-user.dto.ts (in the repo)",
    highlight: [9, 10, 13],
    code: `
      export const createUserSchema = z.object({
        name: z.string().trim().min(2).max(80),
        email: z.email(),
        password: z.string().min(8).max(128),
        role: z.enum(ROLES).default("EMPLOYEE"),
        isActive: z.boolean().default(true),
      });

      // one schema → TypeScript type + runtime validation + OpenAPI schema
      export class CreateUserDto extends createZodDto(createUserSchema) {}

      // app.module.ts — make it actually validate
      providers: [{ provide: APP_PIPE, useClass: ZodValidationPipe }]
    `,
  },
  {
    value: "controller",
    label: "Controller",
    title: "users.controller.ts",
    highlight: [7, 8],
    code: `
      @ApiTags("Users")
      @ApiBearerAuth("bearer")
      @Controller("users")
      export class UsersController {
        @Get(":id")
        @ApiOperation({ summary: "Get one user" })
        // documents the 200 AND strips the result down to the schema
        @ZodResponse({ status: 200, type: UserResponseDto })
        @ApiNotFoundResponse({ description: "No user with this id" })
        findOne(@Param("id", ParseIntPipe) id: number) {
          return this.usersService.findOne(id);
        }
      }
    `,
  },
  {
    value: "serializer",
    label: "Response guard",
    title:
      "helpers/schema.ts · users.dto.ts · serialization-exception.filter.ts",
    highlight: [2, 7, 12, 16],
    code: `
      // Prisma gives Date, JSON needs string: encode on the way out
      export const isoDate = z.codec(z.iso.datetime(), z.date(), {
        decode: (iso) => new Date(iso),
        encode: (date) => date.toISOString(),
      });

      export class UserResponseDto extends createZodDto(userResponseSchema, { codec: true }) {}

      // app.module.ts — enforce @ZodResponse, log when a response breaks its schema
      providers: [
        { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
        { provide: APP_FILTER, useClass: SerializationExceptionFilter },
      ]

      @Catch(ZodSerializationException)
      export class SerializationExceptionFilter extends BaseExceptionFilter {
        catch(exception: ZodSerializationException, host: ArgumentsHost) {
          const request = host.switchToHttp().getRequest<FastifyRequest>();
          this.logger.error(\`\${request.method} \${request.url} broke its schema\`, exception.stack);
          super.catch(exception, host);
        }
      }
    `,
  },
]
</script>

<template>
  <SlideLayout
    section="API Documentation"
    title="API Documentation"
    subtitle="The code is the documentation: schemas and routes flow into an interactive page at /docs."
  >
    <div class="flex flex-wrap items-center gap-2">
      <template v-for="(step, i) in flow" :key="step">
        <Badge :variant="i === flow.length - 1 ? 'default' : 'secondary'">
          {{ step }}
        </Badge>
        <ArrowRight
          v-if="i < flow.length - 1"
          class="size-4 text-muted-foreground"
        />
      </template>
    </div>
    <Tabs default-value="builder">
      <TabsList>
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <CodeSnippet
          :code="tab.code"
          :title="tab.title"
          :highlight="tab.highlight"
        />
      </TabsContent>
    </Tabs>
  </SlideLayout>
</template>
