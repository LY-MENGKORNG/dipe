<script lang="ts">
  import "./layout.css";
  import type { LayoutProps } from "./$types";
  import { ModeWatcher } from "mode-watcher";
  import ModeToggle from "#lib/components/mode-toggle.svelte";
  import { setContext } from "svelte";

  let { children, data }: LayoutProps = $props();
  setContext('sections', () => data.sections);
</script>

<ModeWatcher />
<svelte:head>
  <link rel="icon" href={`http://localhost:3000/favicon.png`} />
  <title>Onboarding</title>
  <meta
    name="description"
    content="Complete your onboarding to get started with the application."
  />
</svelte:head>

<main class="relative min-h-svh w-full">
  <ModeToggle class="absolute top-4 right-4 z-50" />
  {@render children()}
</main>
