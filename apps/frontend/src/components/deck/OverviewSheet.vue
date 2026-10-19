<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useDeck } from '@/composables/useDeck'

const { slides, index, overviewOpen, go } = useDeck()

const sections = computed(() => {
  const groups: { name: string, items: { n: number, title: string }[] }[] = []
  slides.forEach((slide, n) => {
    const last = groups.at(-1)
    if (last?.name === slide.meta.section)
      last.items.push({ n, title: slide.meta.title })
    else
      groups.push({ name: slide.meta.section, items: [{ n, title: slide.meta.title }] })
  })
  return groups
})

function jump(n: number) {
  go(n)
  overviewOpen.value = false
}
</script>

<template>
  <Sheet v-model:open="overviewOpen">
    <SheetContent side="left" class="flex w-full flex-col gap-0 sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Overview</SheetTitle>
        <SheetDescription>{{ slides.length }} slides · jump anywhere</SheetDescription>
      </SheetHeader>
      <ScrollArea class="min-h-0 flex-1">
        <div class="flex flex-col gap-4 px-4 pb-6">
          <template v-for="(section, s) in sections" :key="section.name">
            <Separator v-if="s > 0" />
            <div class="flex flex-col gap-2">
              <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {{ section.name }}
              </p>
              <ItemGroup class="gap-1">
                <Item
                  v-for="item in section.items"
                  :key="item.n"
                  as="a"
                  href="#"
                  size="sm"
                  :variant="item.n === index ? 'muted' : 'default'"
                  @click.prevent="jump(item.n)"
                >
                  <ItemContent>
                    <ItemTitle>{{ item.title }}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Badge :variant="item.n === index ? 'default' : 'outline'">
                      {{ item.n + 1 }}
                    </Badge>
                  </ItemActions>
                </Item>
              </ItemGroup>
            </div>
          </template>
        </div>
      </ScrollArea>
    </SheetContent>
  </Sheet>
</template>
