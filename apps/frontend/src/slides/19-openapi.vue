<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'API Documentation',
  section: 'API Documentation',
  notes: [
    'OpenAPI is the spec (a JSON/YAML description of every route, schema and auth scheme). Swagger UI / Scalar are viewers that render it and let you send requests.',
    'Nest builds the document from code: controllers and routes come for free; DTO schemas come from nestjs-zod; descriptions and responses from @Api* decorators.',
    'This repo already has it: DocumentBuilder in docs.config.ts with a bearer scheme, rendered by Scalar at GET /docs.',
    'With nestjs-zod, run `cleanupOpenApiDoc()` on the document so Zod schemas render cleanly, and register `ZodValidationPipe` globally — otherwise the schema is documented but NOT enforced.',
    'Document responses, not just requests: @ApiOkResponse, @ApiNotFoundResponse, @ApiUnauthorizedResponse. Front-end devs and AI agents read those.',
    'Demo: open /docs, click Authorize, paste the token from /auth/login, call GET /api/users — that is testing endpoints through the UI.',
  ],
}
</script>

<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CodeSnippet from '@/components/deck/CodeSnippet.vue'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const flow = ['Zod DTOs', '@Api* decorators', 'DocumentBuilder', 'openapi.json', 'Scalar at /docs']

const tabs = [
  {
    value: 'builder',
    label: 'docs.config.ts',
    title: 'src/config/docs.config.ts (repo + cleanupOpenApiDoc)',
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
    value: 'dto',
    label: 'Zod DTO',
    title: 'users/dto/create-user.dto.ts (in the repo)',
    highlight: [9, 10, 13],
    code: `
      export const createUserSchema = z.object({
        name: z.string().trim().min(2).max(80),
        email: z.email(),
        password: z.string().min(8).max(128),
        role: z.enum(ROLES).default("employee"),
        isActive: z.boolean().default(true),
      });

      // one schema → TypeScript type + runtime validation + OpenAPI schema
      export class CreateUserDto extends createZodDto(createUserSchema) {}

      // app.module.ts — make it actually validate
      providers: [{ provide: APP_PIPE, useClass: ZodValidationPipe }]
    `,
  },
  {
    value: 'controller',
    label: 'Controller',
    title: 'users.controller.ts',
    highlight: [2, 7, 8, 9],
    code: `
      @ApiTags("Users")
      @ApiBearerAuth("bearer")
      @Controller("users")
      export class UsersController {
        @Get(":id")
        @ApiOperation({ summary: "Get one user" })
        @ApiOkResponse({ type: UserResponseDto })
        @ApiNotFoundResponse({ description: "No user with this id" })
        findOne(@Param("id", ParseIntPipe) id: number) {
          return this.usersService.findOne(id);
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
        <ArrowRight v-if="i < flow.length - 1" class="size-4 text-muted-foreground" />
      </template>
    </div>
    <Tabs default-value="builder">
      <TabsList>
        <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <CodeSnippet :code="tab.code" :title="tab.title" :highlight="tab.highlight" />
      </TabsContent>
    </Tabs>
  </SlideLayout>
</template>
