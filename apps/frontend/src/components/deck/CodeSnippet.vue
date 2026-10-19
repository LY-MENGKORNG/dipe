<script setup lang="ts">
import { FileCode2 } from '@lucide/vue'
import { computed } from 'vue'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
  CodeBlockToken,
  useHighlightedCode,
} from '@/components/ui/code-block'

const props = withDefaults(defineProps<{
  code: string
  lang?: string
  title?: string
  /** 1-based line numbers to emphasise, e.g. [3, 4, 5] */
  highlight?: number[]
  size?: 'default' | 'sm'
  class?: string
}>(), {
  lang: 'ts',
  highlight: () => [],
  size: 'default',
})

// Snippets are written as indented template literals; strip the shared indent.
const source = computed(() => {
  const lines = props.code.replace(/^\n/, '').replace(/\s+$/, '').split('\n')
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)![0].length))
  return lines.map(l => l.slice(indent)).join('\n')
})

const lines = useHighlightedCode(source, () => props.lang)
</script>

<template>
  <CodeBlock :size="size" :class="props.class">
    <CodeBlockHeader v-if="title">
      <CodeBlockTitle>
        <FileCode2 />{{ title }}
      </CodeBlockTitle>
      <CodeBlockActions>
        <CodeBlockCopyButton :value="source" size="icon" />
      </CodeBlockActions>
    </CodeBlockHeader>
    <CodeBlockContent line-numbers>
      <CodeBlockLine
        v-for="(line, i) in lines"
        :key="i"
        :variant="highlight.includes(i + 1) ? 'highlighted' : 'default'"
      >
        <CodeBlockToken v-for="(token, j) in line" :key="j" :token="token" />
      </CodeBlockLine>
    </CodeBlockContent>
  </CodeBlock>
</template>
