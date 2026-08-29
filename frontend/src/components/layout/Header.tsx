import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { useNotificationsCount, useNotificationsPreview } from "../../hooks/useNotifications";
import { useClickOutside } from "../../hooks/useClickOutside";
import { mediaUrl } from "../../lib/media";
import { resolveNotificationHref } from "../../lib/notificationLink";
import { fullLogout } from "../../lib/auth";
import { ThemeToggle } from "../ui/ThemeToggle";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "../../types";

export function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setNotificationsModal = useUIStore((s) => s.setNotificationsModal);
  const { isAuthenticated, user } = useAuthStore();
  const { data: unreadCount } = useNotificationsCount();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");

  const { data: notifications } = useNotificationsPreview(notifOpen);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  useClickOutside(notifRef, () => setNotifOpen(false));
  useClickOutside(profileRef, () => setProfileOpen(false));

  function handleWriteClick() {
    if (!isAuthenticated) return navigate("/login");
    navigate("/write");
  }

  function handleLogoutClick() {
    setProfileOpen(false);
    fullLogout().then(() => navigate("/"));
  }

  function handleNotifClick() {
    if (!isAuthenticated) return;
    setNotifOpen((o) => !o);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    navigate({ pathname: "/", search: params.toString() });
  }

  const userAvatar = mediaUrl(user?.avatar);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/10 z-[100] flex items-center px-6 justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <Link to={isAuthenticated ? "/" : "/login"}>
          <img src={logo} alt="StoryHub" className="w-auto object-contain transition-all p-0 m-0 h-13" />
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-[480px] mr-auto ml-8 lg:ml-24">
        <div className="relative w-full flex items-center">
          <button
            type="submit"
            aria-label="Search"
            className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] hover:text-primary transition-colors"
          >
            search
          </button>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-12 pr-4 text-body-md focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
            placeholder="Search stories..."
            type="text"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={handleWriteClick}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm border border-outline-variant/20 transition-all duration-300 hover:bg-primary hover:text-on-primary hover:border-primary hover:shadow-[0_4px_16px_-2px] hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 group"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-12">edit</span>
          <span>Write</span>
        </button>

        <ThemeToggle />

        <div className="relative" ref={notifRef}>
          <button
            onClick={handleNotifClick}
            className={`hidden md:flex text-on-surface-variant transition-colors relative ${
              isAuthenticated ? "hover:text-primary cursor-pointer" : "cursor-default opacity-60"
            }`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {isAuthenticated && !!unreadCount && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-surface-container-lowest">
                {unreadCount}
              </span>
            )}
          </button>

          {isAuthenticated && notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/20 rounded-xl shadow-xl z-[110]">
              <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
                <span className="font-bold text-on-surface text-label-sm uppercase tracking-wider">Notifications</span>
                <span className="text-[11px] text-primary font-bold cursor-pointer hover:underline">Mark all as read</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {(notifications ?? []).slice(0, 5).map((n, i) => (
                  <NotificationRow key={i} notification={n} />
                ))}
                {!notifications?.length && (
                  <p className="p-6 text-center text-body-md text-on-surface-variant">No notifications yet</p>
                )}
              </div>
              <div className="p-3 text-center border-t border-outline-variant/10">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    setNotificationsModal(true);
                  }}
                  className="text-label-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleNotifClick}
          className={`md:hidden flex w-8 h-8 items-center justify-center rounded-full text-on-surface-variant transition-all ${
            isAuthenticated ? "hover:text-primary cursor-pointer" : "cursor-default opacity-60"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        {isAuthenticated ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/10 ring-offset-2 ring-offset-surface transition-all hover:ring-primary/30 bg-surface-variant flex items-center justify-center"
            >
              {userAvatar ? (
                <img alt={user?.username} className="w-full h-full object-cover" src={userAvatar} />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
              )}
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/20 rounded-xl shadow-xl z-[110]">
                <div className="p-4 border-b border-outline-variant/10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center flex-shrink-0">
                    {userAvatar ? (
                      <img alt={user?.username} className="w-full h-full object-cover" src={userAvatar} />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant text-[24px]">person</span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-on-surface text-body-md truncate">{user?.full_name}</span>
                    <span className="text-xs text-on-surface-variant truncate">{user?.email}</span>
                  </div>
                </div>
                <div className="p-2">
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <span className="text-label-sm">Profile</span>
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    <span className="text-label-sm">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-label-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant cursor-not-allowed"
            aria-hidden
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
          </button>
        )}
      </div>
    </header>
  );
}

function NotificationRow({ notification: n }: { notification: Notification }) {
  const avatar = mediaUrl(n.actor.avatar);
  const href = resolveNotificationHref(n);

  const content = (
    <div
      className={`relative p-4 flex items-start gap-3 transition-colors cursor-pointer border-b border-outline-variant/5 ${
        n.is_read ? "hover:bg-primary/5" : "bg-primary/5 hover:bg-primary/10"
      }`}
    >
      {!n.is_read && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-variant flex items-center justify-center ml-1">
        {avatar ? (
          <img src={avatar} className="w-full h-full object-cover" alt="" />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-body-md text-on-surface">
          <span className="font-bold">{n.actor.full_name ?? n.actor.username}</span> {notificationVerbText(n)}
        </p>
      <span className="text-xs text-on-surface-variant">
        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
      </span>
      </div>
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}

function notificationVerbText(n: Notification) {
  const targetLabel =
    n.target?.type === "story" && n.target.title ? (
      <span className="text-primary font-semibold">"{n.target.title}"</span>
    ) : n.target?.type === "comment" && n.target.content ? (
      <span className="text-primary font-semibold">"{n.target.content}"</span>
    ) : null;

  switch (n.verb) {
    case "liked_story":
      return <>liked your story {targetLabel}</>;
    case "liked_comment":
      return <>liked your comment {targetLabel}</>;
    case "commented":
      return <>commented on your story {targetLabel}</>;
    case "replied":
      return <>replied to your comment {targetLabel}</>;
    case "new_follower":
      return "started following you";
    case "complete_profile":
      return "complete your profile";
    default:
      return "";
  }
}
