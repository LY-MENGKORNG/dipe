import { computed, ref, watch } from "vue"
import { useColorMode, useEventListener, useFullscreen } from "@vueuse/core"
import { slides } from "@/slides"

export type Direction = "next" | "prev"

function readHash() {
  const n = Number.parseInt(location.hash.replace(/^#\/?/, ""), 10)
  return Number.isNaN(n) ? 0 : Math.min(Math.max(n - 1, 0), slides.length - 1)
}

// Shared across the deck so the toolbar, overview and keyboard agree.
const index = ref(readHash())
const direction = ref<Direction>("next")
const notesOpen = ref(false)
const overviewOpen = ref(false)

watch(index, (i) => history.replaceState(null, "", `#/${i + 1}`), {
  immediate: true,
})

export function useDeck() {
  const current = computed(() => slides[index.value]!)
  const progress = computed(() => ((index.value + 1) / slides.length) * 100)
  const isFirst = computed(() => index.value === 0)
  const isLast = computed(() => index.value === slides.length - 1)

  function go(to: number) {
    const target = Math.min(Math.max(to, 0), slides.length - 1)
    if (target === index.value) return
    direction.value = target > index.value ? "next" : "prev"
    index.value = target
  }

  const next = () => go(index.value + 1)
  const prev = () => go(index.value - 1)

  return {
    slides,
    index,
    current,
    direction,
    progress,
    isFirst,
    isLast,
    notesOpen,
    overviewOpen,
    go,
    next,
    prev,
  }
}

// Registers keyboard shortcuts once, from the deck root.
export function useDeckKeyboard() {
  const deck = useDeck()
  const { toggle: toggleFullscreen } = useFullscreen()
  const mode = useColorMode()

  useEventListener(window, "hashchange", () => deck.go(readHash()))

  useEventListener(window, "keydown", (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    // Let inputs (e.g. the live hashing demo) keep their keys.
    if (target?.closest("input, textarea, [contenteditable=true]")) return
    if (event.metaKey || event.ctrlKey || event.altKey) return

    switch (event.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
      case "l":
        deck.next()
        break
      case "ArrowLeft":
      case "PageUp":
      case "h":
        deck.prev()
        break
      case "Home":
        deck.go(0)
        break
      case "End":
        deck.go(deck.slides.length - 1)
        break
      case "n":
        deck.notesOpen.value = !deck.notesOpen.value
        break
      case "o":
        deck.overviewOpen.value = !deck.overviewOpen.value
        break
      case "f":
        void toggleFullscreen()
        break
      case "d":
        mode.value = mode.value === "dark" ? "light" : "dark"
        break
      default:
        return
    }
    event.preventDefault()
  })

  return deck
}
