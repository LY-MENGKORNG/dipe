<script setup lang="ts">
import { Badge } from '@/components/ui/badge'

defineProps<{
  section?: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <section class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:px-10">
    <header class="flex flex-col gap-3">
      <Badge v-if="section" variant="secondary" class="stagger w-fit">
        {{ section }}
      </Badge>
      <h1 class="stagger font-heading text-3xl font-semibold tracking-tight md:text-4xl">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="stagger max-w-3xl text-lg text-muted-foreground">
        {{ subtitle }}
      </p>
    </header>
    <div class="stagger flex flex-col gap-6">
      <slot />
    </div>
  </section>
</template>
