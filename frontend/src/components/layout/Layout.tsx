import { useEffect } from "react";
import { Outlet, useNavigate, useMatch } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";
import { MobileSearch } from "./MobileSearch";
import { TagsModal } from "../modals/TagsModal";
import { CategoriesModal } from "../modals/CategoriesModal";
import { NotificationsModal } from "../modals/NotificationsModal";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

export function Layout() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { sidebarCollapsedDesktop, sidebarOpenMobile, closeMobileSidebar } = useUIStore();

  const isOwnProfileMatch = useMatch("/profile");
  const isPublicProfileMatch = useMatch("/:username");
  const isWriteMatch = useMatch("/write");
  const isWriteEditMatch = useMatch("/write/:slug");
  const RESERVED_SINGLE_SEGMENT_PATHS = ["login", "my-stories", "saved", "follow-required", "write", "following", "settings"];
  const isReservedPath =
    !!isPublicProfileMatch && RESERVED_SINGLE_SEGMENT_PATHS.includes(isPublicProfileMatch.params.username ?? "");
  const isProfilePage = Boolean(isOwnProfileMatch || (isPublicProfileMatch && !isReservedPath));
  const isSettingsMatch = useMatch("/settings");
  const isWritePage = Boolean(isWriteMatch || isWriteEditMatch || isSettingsMatch);
  const showRightSidebar = !isProfilePage && !isWritePage;

  const isHelpMatch = useMatch("/help");
  const isHelpPage = Boolean(isHelpMatch);

  useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed-desktop", sidebarCollapsedDesktop);
  }, [sidebarCollapsedDesktop]);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open-mobile", sidebarOpenMobile);
  }, [sidebarOpenMobile]);

  return (
    <div className={`text-on-surface font-body-md min-h-screen flex ${isHelpPage ? "bg-surface-container-low" : "bg-surface"}`}>
      {isHelpPage && (
        <>
          <div className="bg-orb bg-primary-fixed" style={{ width: 600, height: 600, top: -100, left: -100 }} />
          <div className="bg-orb bg-inverse-primary" style={{ width: 500, height: 500, bottom: "20%", right: -50, animationDelay: "-5s", animationDuration: "25s" }} />
          <div className="bg-orb bg-tertiary-fixed" style={{ width: 400, height: 400, top: "40%", left: "20%", animationDelay: "-10s", animationDuration: "22s", opacity: 0.2 }} />
        </>
      )}
      <Header />
      <Sidebar />

      <div
        id="sidebar-overlay"
        onClick={closeMobileSidebar}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140] transition-opacity duration-300 md:hidden"
      />

      <main
        id="main-content"
        className={`md:ml-[280px] flex-1 flex flex-col items-center w-full min-h-screen pt-4 md:pt-8 pb-32 md:pb-16 px-margin-mobile md:px-margin-desktop relative mt-16 ${
          showRightSidebar ? "lg:mr-[280px]" : ""
        }`}
      >
        <MobileSearch />

        <div className="w-full flex flex-col items-center">
          <Outlet />
        </div>
      </main>

      {showRightSidebar && <RightSidebar />}

      <button
        aria-label="Write story"
        onClick={() => navigate(isAuthenticated ? "/write" : "/login")}
        className="md:hidden fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-[200]"
      >
        <span className="material-symbols-outlined text-[24px]">edit</span>
      </button>

      <CategoriesModal />
      <TagsModal />
      <NotificationsModal />
    </div>
  );
}