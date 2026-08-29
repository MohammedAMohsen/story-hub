import type { SettingsTab } from "../../pages/Settings";

const TABS: { key: SettingsTab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "account", label: "Account" },
  { key: "email", label: "Email" },
  { key: "password", label: "Password" },
];

export function SettingsNav({
  activeTab,
  onTabChange,
  onLogout,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <h1 className="font-headline-md text-headline-md text-on-surface mb-6">Settings</h1>
      <nav className="flex flex-col gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-left text-body-md transition-colors ${
                active
                  ? "font-bold bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              {tab.label}
              <span className={`material-symbols-outlined text-[18px] ${active ? "" : "opacity-0"}`}>
                chevron_right
              </span>
            </button>
          );
        })}

        <hr className="my-2 border-outline-variant/20" />

        <button
          type="button"
          onClick={onLogout}
          className="flex items-center px-4 py-3 rounded-lg text-left text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
        >
          Log Out
        </button>
        <button
          type="button"
          onClick={() => onTabChange("danger")}
          className="flex items-center px-4 py-3 rounded-lg text-left text-body-md text-error hover:bg-error/5 transition-colors mt-4"
        >
          Delete Account
        </button>
      </nav>
    </aside>
  );
}
