import { markRaw, type Component } from "vue"

export interface SlideMeta {
  title: string
  section: string
  /** What to say — read these while rehearsing (press N during the talk). */
  notes: string[]
  /** Optional question to throw at the audience. */
  ask?: string
}

export interface Slide {
  id: string
  meta: SlideMeta
  component: Component
}

interface SlideModule {
  default: Component
  meta: SlideMeta
}

// Every `NN-name.vue` file in this folder is a slide, ordered by its prefix.
const modules = import.meta.glob<SlideModule>("./*.vue", { eager: true })

export const slides: Slide[] = Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, mod]) => ({
    id: path.replace(/^\.\/|\.vue$/g, ""),
    meta: mod.meta,
    component: markRaw(mod.default),
  }))
