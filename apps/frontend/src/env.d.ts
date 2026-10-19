/// <reference types="vite/client" />

// Lets non-Vue tooling (oxlint's type-aware rules) type `.vue` imports.
// vue-tsc ignores this and resolves the real component types.
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}
