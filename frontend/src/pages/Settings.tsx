import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingsNav } from "../components/settings/SettingsNav";
import { SaveBanner } from "../components/settings/SaveBanner";
import { ProfileSection } from "../components/settings/ProfileSection";
import { AccountSection } from "../components/settings/AccountSection";
import { EmailSection } from "../components/settings/EmailSection";
import { PasswordSection } from "../components/settings/PasswordSection";
import { DangerSection } from "../components/settings/DangerSection";
import { fullLogout } from "../lib/auth";

export type SettingsTab = "profile" | "account" | "email" | "password" | "danger";

export interface SectionHandle {
  save: () => Promise<void>;
  reset: () => void;
}

export function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [profileDirty, setProfileDirty] = useState(false);
  const [accountDirty, setAccountDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const profileRef = useRef<SectionHandle>(null);
  const accountRef = useRef<SectionHandle>(null);

  const dirty = (activeTab === "profile" && profileDirty) || (activeTab === "account" && accountDirty);

  async function handleSave() {
    setSaving(true);
    try {
      if (activeTab === "profile") await profileRef.current?.save();
      if (activeTab === "account") await accountRef.current?.save();
    } catch {
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (activeTab === "profile") profileRef.current?.reset();
    if (activeTab === "account") accountRef.current?.reset();
  }

  function handleLogout() {
    fullLogout().then(() => navigate("/"));
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 max-w-[1000px] mx-auto">
      <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 md:p-8 shadow-sm">
        <SaveBanner visible={dirty} saving={saving} onCancel={handleCancel} onSave={handleSave} />

        <div className={activeTab === "profile" ? "block" : "hidden"}>
          <ProfileSection ref={profileRef} onDirtyChange={setProfileDirty} />
        </div>
        <div className={activeTab === "account" ? "block" : "hidden"}>
          <AccountSection ref={accountRef} onDirtyChange={setAccountDirty} />
        </div>
        {activeTab === "email" && <EmailSection />}
        {activeTab === "password" && <PasswordSection />}
        {activeTab === "danger" && <DangerSection onGoToPassword={() => setActiveTab("password")} />}
      </div>
    </div>
  );
}
