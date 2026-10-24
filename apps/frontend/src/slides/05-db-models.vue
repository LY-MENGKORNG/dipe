<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Schema models & relationships",
  section: "Database & ORM",
  notes: [
    "These are the real models from the repo. A User has many Posts — a one-to-many relation.",
    'The foreign key lives on the "many" side (Post). `fields` is our column, `references` is the column on the other table.',
    'The relation name "post_poster" connects both sides; it is required when two models have more than one relation between them, optional otherwise.',
    "@@map renames the table, @@index adds an index — always index foreign keys you filter or join on.",
    "Naming nit worth calling out live: the FK on Post is called `postId` but it points at a user. `authorId` / `posterId` would read better. Renaming later costs a migration.",
    "Walk through the accordion for 1-1 and many-to-many so people can map their own domain.",
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
    employee
    staff
    admin
  }

  model User {
    id            Int      @id @default(autoincrement())
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
    name          String
    email         String   @unique
    password_hash String
    role          Role     @default(employee)
    isActive      Boolean  @default(true)

    postedPosts Post[] @relation("post_poster")

    @@map("user")
  }
`

const post = `
  model Post {
    id          Int      @id @default(autoincrement())
    title       String
    description String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    postId Int
    poster User @relation("post_poster",
                  fields: [postId], references: [id])

    @@index([postId])
    @@map("post")
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
    title: "One-to-many — User → Posts (what we have)",
    code: `
      // FK lives on the "many" side
      model Post {
        authorId Int
        author   User @relation(fields: [authorId], references: [id])
      }
      model User { posts Post[] }
    `,
  },
  {
    value: "n-m",
    title: "Many-to-many — Post ↔ Tag",
    code: `
      // implicit: Prisma creates the _PostToTag join table
      model Post { tags Tag[] }
      model Tag  { posts Post[] }
      // explicit join model when the link has data (e.g. addedAt)
    `,
  },
]
</script>

<template>
  <SlideLayout
    section="Database & ORM"
    title="Schema models & relationships"
    subtitle="Our real models: one User has many Posts."
  >
    <div class="grid gap-4 lg:grid-cols-2">
      <CodeSnippet
        :code="user"
        lang="prisma"
        title="db/models/user.prisma"
        size="sm"
        :highlight="[17]"
      />
      <CodeSnippet
        :code="post"
        lang="prisma"
        title="db/models/post.prisma"
        size="sm"
        :highlight="[8, 9, 10, 12]"
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
