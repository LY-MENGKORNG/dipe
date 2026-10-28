<script lang="ts">
  import { getContext } from "svelte";
  import type { PageProps } from "./$types";



  const sections = getContext<() => PageProps["data"]["sections"] >('sections')
</script>

{#each sections() as section}
  <div class="section">{section.title}</div>
{/each}
