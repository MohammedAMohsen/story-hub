import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { QuietCorner } from "./QuietCorner";

function linkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 py-3 px-4 transition-all hover:translate-x-1 rounded-r-lg group border-l-4 ${
    isActive
      ? "border-primary text-primary font-bold bg-surface-container-low"
      : "border-transparent text-on-surface-variant hover:bg-surface-container-low hover:border-outline-variant/30"
  }`;
}

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <li className="mb-1">
      <NavLink to={to} end={to === "/"} className={linkClass}>
        {({ isActive }) => (
          <>
            <span className={`material-symbols-outlined ${isActive ? "filled" : ""}`}>{icon}</span>
            <span>{label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export function Sidebar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    
    <nav
      id="sidebar"
      className="fixed left-0 top-0 h-screen w-[280px] z-[150] md:z-50 shadow-sm border-r border-outline-variant/10 pt-20 pb-8 px-4 bg-surface-container-lowest overflow-y-auto"
    >
      <ul className="flex flex-col gap-2 flex-grow font-body-md text-body-md font-medium">
       {isAuthenticated ? (
          <>
            <NavItem to="/" icon="home" label="Home" />
            <NavItem to="/following" icon="group" label="Following" />
            <hr className="mb-4 border-outline-variant/30 mx-4" />
            <NavItem to="/my-stories" icon="book" label="My Stories" />
            <NavItem to="/saved" icon="bookmark" label="Saved Stories" />
            <hr className="mb-4 border-outline-variant/30 mx-4" />
            <NavItem to="/profile" icon="person" label="Profile" />
            <li className="mb-16">
              <NavLink to="/help" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined ${isActive ? "filled" : ""}`}>help</span>
                    <span>Help</span>
                  </>
                )}
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <NavItem to="/" icon="home" label="Home" />
            <li className="mb-1">
              <NavLink to="/help" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined ${isActive ? "filled" : ""}`}>help</span>
                    <span>Help</span>
                  </>
                )}
              </NavLink>
            </li>
            <hr className="mb-4 border-outline-variant/30 mx-4" />
            <NavItem to="/login" icon="login" label="Login" />
            <li className="mb-16">
              <NavLink to="/signup" className={linkClass}>
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined ${isActive ? "filled" : ""}`}>person_add</span>
                    <span>Register</span>
                  </>
                )}
              </NavLink>
            </li>
          </>
        )}

        <li className="px-2 mt-auto pb-8" style={{ marginTop: "3rem" }}>
          <div className="bg-primary/5 backdrop-blur-md border border-primary/10 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase">A Quiet Corner</span>
            <QuietCorner
              quotes={[
                "Every story leaves something behind — quiet and lasting, if you let it stay.",
                "The best stories don't ask to be finished quickly, only to be felt fully.",
                "Somewhere between the first line and the last, a little of you changes too.",
                "A story shared slowly is remembered far longer than one read in a hurry.",
                "Take a quiet breath before you begin. The gentlest stories often hold the most.",
              ]}
            />
          </div>
        </li>
      </ul>
    </nav>
  );
}