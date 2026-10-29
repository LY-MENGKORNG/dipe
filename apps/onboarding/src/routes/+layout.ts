import type { LayoutLoad } from "./$types"

export const load: LayoutLoad = async () => {
  return {
    sections: [
      { slug: "profile", title: "Profile" },
      { slug: "notifications", title: "Notifications" },
    ],
  }
}
