import type { Handle } from "@sveltejs/kit/hooks"

export const handle: Handle = async ({ event, resolve }) => {
  console.log("invoked!")
  if (event.url.pathname.startsWith("/custom")) {
    return new Response("custom response")
  }

  const response = await resolve(event)
  return response
}
