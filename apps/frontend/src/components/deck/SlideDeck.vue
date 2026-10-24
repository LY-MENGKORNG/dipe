<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Maximize,
  NotebookPen,
} from "@lucide/vue"
import { useFullscreen } from "@vueuse/core"
import { computed } from "vue"
import ModeToggle from "@/components/ModeToggle.vue"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDeckKeyboard } from "@/composables/useDeck"
import NotesSheet from "./NotesSheet.vue"
import OverviewSheet from "./OverviewSheet.vue"

const deck = useDeckKeyboard()
const {
  index,
  current,
  direction,
  progress,
  isFirst,
  isLast,
  slides,
  notesOpen,
  overviewOpen,
} = deck
const { toggle: toggleFullscreen } = useFullscreen()

const transition = computed(() => `slide-${direction.value}`)

const actions = [
  {
    label: "Overview",
    key: "O",
    icon: LayoutGrid,
    run: () => (overviewOpen.value = true),
  },
  {
    label: "Speaker notes",
    key: "N",
    icon: NotebookPen,
    run: () => (notesOpen.value = true),
  },
  {
    label: "Fullscreen",
    key: "F",
    icon: Maximize,
    run: () => toggleFullscreen(),
  },
]
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <div class="flex h-dvh flex-col overflow-hidden bg-background">
      <header
        class="flex h-14 shrink-0 items-center gap-4 border-b px-4 md:px-6"
      >
        <Breadcrumb class="min-w-0 flex-1">
          <BreadcrumbList class="flex-nowrap">
            <BreadcrumbItem class="hidden md:inline-flex">
              DIPE
            </BreadcrumbItem>
            <BreadcrumbSeparator class="hidden md:list-item" />
            <BreadcrumbItem class="hidden sm:inline-flex">
              {{ current.meta.section }}
            </BreadcrumbItem>
            <BreadcrumbSeparator class="hidden sm:list-item" />
            <BreadcrumbItem class="min-w-0">
              <BreadcrumbPage class="truncate">
                {{ current.meta.title }}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div class="flex items-center gap-1">
          <Tooltip v-for="action in actions" :key="action.label">
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                :aria-label="action.label"
                @click="action.run"
              >
                <component :is="action.icon" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {{ action.label }} <Kbd>{{ action.key }}</Kbd>
            </TooltipContent>
          </Tooltip>
          <ModeToggle />
        </div>
      </header>

      <ScrollArea class="min-h-0 flex-1">
        <main
          class="flex min-h-[calc(100dvh-7.5rem)] items-center overflow-x-hidden"
        >
          <Transition :name="transition" mode="out-in">
            <component :is="current.component" :key="current.id" />
          </Transition>
        </main>
      </ScrollArea>

      <footer class="flex shrink-0 flex-col border-t">
        <Progress :model-value="progress" class="h-1 rounded-none" />
        <div class="flex h-14 items-center gap-3 px-4 md:px-6">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous slide"
            :disabled="isFirst"
            @click="deck.prev"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next slide"
            :disabled="isLast"
            @click="deck.next"
          >
            <ChevronRight />
          </Button>
          <span class="font-heading text-sm tabular-nums text-muted-foreground">
            {{ index + 1 }} / {{ slides.length }}
          </span>
          <div
            class="ms-auto hidden items-center gap-4 text-xs text-muted-foreground md:flex"
          >
            <span class="flex items-center gap-1.5">
              <KbdGroup><Kbd>←</Kbd><Kbd>→</Kbd></KbdGroup> navigate
            </span>
            <span class="flex items-center gap-1.5"><Kbd>O</Kbd> overview</span>
            <span class="flex items-center gap-1.5"><Kbd>N</Kbd> notes</span>
            <span class="flex items-center gap-1.5"
              ><Kbd>F</Kbd> fullscreen</span
            >
          </div>
        </div>
      </footer>

      <OverviewSheet />
      <NotesSheet />
    </div>
  </TooltipProvider>
</template>
