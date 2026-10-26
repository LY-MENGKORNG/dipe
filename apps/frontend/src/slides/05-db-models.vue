<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Schema models & relationships",
  section: "Database & ORM",
  notes: [
    "These are the real models from the repo: User, Workspace, Project and two join models — WorkspaceMember and ProjectMember.",
    'One-to-many: a User owns many Workspaces (Workspace.ownerId), a Workspace has many Projects (Project.workspaceId). The foreign key always lives on the "many" side.',
    "Many-to-many: users ↔ workspaces goes through WorkspaceMember, users ↔ projects through ProjectMember. Explicit join models because the link carries data (ProjectMember.role).",
    "@@id([userId, workspaceId]) is a composite primary key — the same user cannot join the same workspace twice.",
    "Join rows use onDelete: Cascade: deleting a user, workspace or project removes its membership rows instead of blocking the delete. Workspace.owner stays RESTRICT on purpose — deleting a user who still owns a workspace returns 409.",
    "User has two relations to Workspace (createdWorkspaces via owner, workspaces via WorkspaceMember). Separate join model keeps them unambiguous; otherwise you need a named @relation on both sides.",
    "Enums live in db/models/types/*.prisma (Role, Language, Currency, WorkspaceVisibility, ProjectMemberRole). Values are UPPER_CASE — changing an enum's values is a migration, so pick the convention early.",
    "@@map renames the table, @@index adds an index — always index foreign keys you filter or join on (workspace.owner_id, project.workspace_id).",
  ],
}
</script>

<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"
import Term from "@/components/deck/Term.vue"

const user = `
  enum Role {
    EMPLOYEE
    STAFF
    ADMIN
  }

  model User {
    id           Int      @id @default(autoincrement())
    name         String
    email        String   @unique
    passwordHash String   @map("password_hash")
    role         Role     @default(EMPLOYEE)
    language     Language @default(EN)
    isActive     Boolean  @default(true) @map("is_active")
    createdAt    DateTime @default(now()) @map("created_at")
    updatedAt    DateTime @updatedAt @map("updated_at")

    projects          ProjectMember[]   // user *-* project
    workspaces        WorkspaceMember[] // user *-* workspace
    createdWorkspaces Workspace[]       // user 1-* workspace

    @@map("user")
  }
`

const workspace = `
  model Workspace {
    id         Int                 @id @default(autoincrement())
    name       String
    slug       String
    visibility WorkspaceVisibility @default(PRIVATE)

    ownerId Int  @map("owner_id")
    owner   User @relation(fields: [ownerId], references: [id])

    projects Project[]
    members  WorkspaceMember[]

    @@unique([slug])
    @@index([ownerId])
    @@map("workspace")
  }

  model WorkspaceMember {
    userId      Int @map("user_id")
    workspaceId Int @map("workspace_id")

    member    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
    workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

    @@id([userId, workspaceId])
    @@map("workspace_members")
  }
`

const relations = [
  {
    value: "1-1",
    title: "One-to-one — User ↔ Profile",
    code: `
      model Profile {
        id     Int  @id @default(autoincrement())
        userId Int  @unique          // @unique makes it 1-1
        user   User @relation(fields: [userId], references: [id])
      }
    `,
  },
  {
    value: "1-n",
    title: "One-to-many — Workspace → Projects (what we have)",
    code: `
      // FK lives on the "many" side
      model Project {
        workspaceId Int       @map("workspace_id")
        workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
        @@index([workspaceId])
      }
      model Workspace { projects Project[] }
    `,
  },
  {
    value: "n-m",
    title: "Many-to-many — User ↔ Project via ProjectMember (what we have)",
    code: `
      // explicit join model: the link carries data (role)
      model ProjectMember {
        projectId String            @map("project_id")
        memberId  Int               @map("member_id")
        role      ProjectMemberRole @default(MEMBER)

        project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
        user    User    @relation(fields: [memberId], references: [id], onDelete: Cascade)

        @@id([projectId, memberId])
      }
      // implicit alternative when the link has no data:
      // model Project { tags Tag[] }  model Tag { projects Project[] }
    `,
  },
]
</script>

<template>
  <SlideLayout
    section="Database & ORM"
    title="Schema models & relationships"
    subtitle="Our real models: users own workspaces, workspaces hold projects, join models link members."
  >
    <div class="grid gap-4 lg:grid-cols-2">
      <CodeSnippet
        :code="user"
        lang="prisma"
        title="db/models/user.prisma"
        size="sm"
        :highlight="[18, 19, 20]"
      />
      <CodeSnippet
        :code="workspace"
        lang="prisma"
        title="db/models/workspace.prisma + workspace-member.prisma"
        size="sm"
        :highlight="[7, 8, 25]"
      />
    </div>

    <p class="text-sm text-muted-foreground">
      Hover:
      <Term
        label="@relation"
        definition="Links two models. fields = the FK column on this model, references = the key on the other model."
      />
      ·
      <Term
        label="@@map"
        definition='Maps the model to a different table name in the database (User → "user").'
      />
      ·
      <Term
        label="@@index"
        definition="Creates a database index. Index the foreign keys you join or filter on."
      />
      ·
      <Term
        label="@updatedAt"
        definition="Prisma sets this timestamp automatically on every update."
      />
      ·
      <Term
        label="@@id"
        definition="Composite primary key. On a join model it stops the same pair being linked twice."
      />
    </p>

    <Accordion type="single" collapsible>
      <AccordionItem
        v-for="rel in relations"
        :key="rel.value"
        :value="rel.value"
      >
        <AccordionTrigger>{{ rel.title }}</AccordionTrigger>
        <AccordionContent>
          <CodeSnippet :code="rel.code" lang="prisma" size="sm" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </SlideLayout>
</template>
