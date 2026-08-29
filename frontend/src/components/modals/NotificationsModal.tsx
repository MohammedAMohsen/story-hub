import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useUIStore } from "../../store/uiStore";
import { useNotificationsInfinite } from "../../hooks/useNotifications";
import { mediaUrl } from "../../lib/media";
import { resolveNotificationHref } from "../../lib/notificationLink";
import { GlassModal } from "../ui/GlassModal";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "../../types";

export function NotificationsModal() {
  const { notificationsModalOpen, setNotificationsModal } = useUIStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotificationsInfinite(notificationsModalOpen);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !notificationsModalOpen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, notificationsModalOpen]);

  const notifications = data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <GlassModal open={notificationsModalOpen} onClose={() => setNotificationsModal(false)} title="All Notifications">
      {isLoading && <p className="text-body-md text-on-surface-variant">Loading...</p>}
      <div className="max-h-[500px] overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-1">
        {notifications.map((n, i) => (
          <NotificationRow key={i} notification={n} onNavigate={() => setNotificationsModal(false)} />
        ))}
        {!isLoading && !notifications.length && (
          <p className="text-center text-body-md text-on-surface-variant py-8">No notifications</p>
        )}
        <div ref={loadMoreRef} className="h-2" />
        {isFetchingNextPage && (
          <p className="text-center text-xs text-on-surface-variant py-3">Loading more...</p>
        )}
        </div>
      </div>
    </GlassModal>
  );
}

function NotificationRow({ notification: n, onNavigate }: { notification: Notification; onNavigate: () => void }) {
  const avatar = mediaUrl(n.actor.avatar);
  const href = resolveNotificationHref(n);

  const targetLabel =
    n.target?.type === "story" && n.target.title ? (
      <span className="text-primary font-semibold">"{n.target.title}"</span>
    ) : n.target?.type === "comment" && n.target.content ? (
      <span className="text-primary font-semibold">"{n.target.content}"</span>
    ) : null;

  const verbText: Record<string, React.ReactNode> = {
    liked_story: <>liked your story {targetLabel}</>,
    liked_comment: <>liked your comment {targetLabel}</>,
    commented: <>commented on your story {targetLabel}</>,
    replied: <>replied to your comment {targetLabel}</>,
    new_follower: "started following you",
    complete_profile: "complete your profile",
  };

  const row = (
    <div
      className={`relative p-3 flex items-start gap-3 rounded-xl transition-colors cursor-pointer ${
        n.is_read ? "hover:bg-primary/5" : "bg-primary/5 hover:bg-primary/10"
      }`}
    >
      {!n.is_read && <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-variant flex items-center justify-center ml-1">
        {avatar ? (
          <img src={avatar} className="w-full h-full object-cover" alt="" />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-body-md text-on-surface">
          <span className="font-bold">{n.actor.full_name ?? n.actor.username}</span> {verbText[n.verb]}
        </p>
        <span className="text-xs text-on-surface-variant">
          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  );

  return href ? (
    <Link to={href} onClick={onNavigate}>
      {row}
    </Link>
  ) : (
    row
  );
}
