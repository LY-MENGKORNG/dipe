<script setup lang="ts">
import { Lightbulb } from "@lucide/vue"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useDeck } from "@/composables/useDeck"

const { current, notesOpen } = useDeck()
</script>

<template>
  <Sheet v-model:open="notesOpen">
    <SheetContent side="right" class="flex w-full flex-col gap-0 sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>Speaker notes</SheetTitle>
        <SheetDescription>{{ current.meta.title }}</SheetDescription>
      </SheetHeader>
      <ScrollArea class="min-h-0 flex-1">
        <div class="flex flex-col gap-4 px-4 pb-6">
          <ol
            class="flex list-decimal flex-col gap-3 ps-5 text-sm leading-relaxed"
          >
            <li v-for="note in current.meta.notes" :key="note">
              {{ note }}
            </li>
          </ol>
          <Alert v-if="current.meta.ask">
            <Lightbulb />
            <AlertTitle>Ask the audience</AlertTitle>
            <AlertDescription>{{ current.meta.ask }}</AlertDescription>
          </Alert>
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>
