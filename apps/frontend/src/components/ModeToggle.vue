<script setup lang="ts">
import { useColorMode } from "@vueuse/core"
import { Moon, Sun } from "@lucide/vue"
import { Button } from "./ui/button"

// Pass { disableTransition: false } to enable transitions
const mode = useColorMode()
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    @click="mode = mode === 'dark' ? 'light' : 'dark'"
  >
    <!-- <Icon icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /> -->
    <Moon
      class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <!-- <Icon icon="radix-icons:sun" class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> -->
    <Sun
      class="absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>
