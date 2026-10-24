<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Recap & questions",
  section: "Wrap-up",
  notes: [
    "One sentence per topic — say them out loud, they are the takeaways people should leave with.",
    'Open the floor. If it is quiet, seed it with: "Which of today\'s topics would break first in your current project?"',
    "Point people to the repo: every snippet on these slides comes from (or is meant for) apps/backend.",
  ],
}
</script>

<script setup lang="ts">
import { MessageCircleQuestion, RotateCcw } from "@lucide/vue"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { useDeck } from "@/composables/useDeck"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const { go } = useDeck()

const takeaways = [
  {
    topic: "Database & ORM",
    line: "Models → reviewed migrations → typed client. Transactions short. Never select password_hash.",
  },
  {
    topic: "HTTP client",
    line: "Wrap each provider, always set a timeout, retry only what can succeed, validate what comes back.",
  },
  {
    topic: "Events & queues",
    line: "Events decouple; queues survive crashes and retry. Slow or flaky work goes to a worker.",
  },
  {
    topic: "Security",
    line: "401 = who are you, 403 = not allowed. Hash passwords (argon2id), encrypt what you must read back.",
  },
  {
    topic: "Testing",
    line: "Many unit tests with mocks, a few E2E journeys that prove the security contract.",
  },
  {
    topic: "OpenAPI",
    line: "One Zod schema → type, validation and docs. Register the pipe so it is enforced.",
  },
]
</script>

<template>
  <SlideLayout section="Wrap-up" title="Recap & questions">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <ItemGroup class="gap-2">
        <Item
          v-for="item in takeaways"
          :key="item.topic"
          variant="muted"
          size="sm"
        >
          <ItemContent>
            <ItemTitle>{{ item.topic }}</ItemTitle>
            <ItemDescription class="line-clamp-none">
              {{ item.line }}
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
      <Empty class="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageCircleQuestion />
          </EmptyMedia>
          <EmptyTitle>Questions?</EmptyTitle>
          <EmptyDescription
            >Nothing here yet — that's your cue.</EmptyDescription
          >
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" @click="go(0)">
            <RotateCcw data-icon="inline-start" />
            Back to start
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  </SlideLayout>
</template>
