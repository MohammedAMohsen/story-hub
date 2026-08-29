import type { Notification } from "../types";

export function resolveNotificationHref(n: Notification): string | undefined {
  if (n.target) {
    if (n.target.type === "story") {
      return `/story/${n.target.slug}`;
    }

    if (n.target.type === "comment") {
      if (n.target.story_slug) {
        const params = new URLSearchParams({ openComment: String(n.target.id) });
        if (n.target.parent) params.set("openParent", String(n.target.parent));
        return `/story/${n.target.story_slug}?${params.toString()}#comments`;
      }
      return "/";
    }
  }

  if (n.verb === "new_follower" && n.actor.username) {
    return `/${n.actor.username}`;
  }

  return undefined;
}
