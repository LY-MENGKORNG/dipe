<script setup lang="ts">
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

// Inline glossary term: hover to reveal a short definition while presenting.
defineProps<{
  label: string
  definition: string
}>()
</script>

<template>
  <HoverCard :open-delay="150">
    <HoverCardTrigger as-child>
      <span
        class="cursor-help underline decoration-dotted underline-offset-4"
        >{{ label }}</span
      >
    </HoverCardTrigger>
    <HoverCardContent class="w-80">
      <div class="flex flex-col gap-1">
        <p class="text-sm font-semibold">
          {{ label }}
        </p>
        <p class="text-sm text-muted-foreground">
          {{ definition }}
        </p>
      </div>
    </HoverCardContent>
  </HoverCard>
</template>
