import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { usePrivateProfile } from "../../hooks/useProfile";
import { useUpdateProfile } from "../../hooks/useSettings";
import { mediaUrl } from "../../lib/media";
import type { SectionHandle } from "../../pages/Settings";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ProfileSection = forwardRef<SectionHandle, { onDirtyChange: (dirty: boolean) => void }>(
  function ProfileSection({ onDirtyChange }, ref) {
    const { data: profile, isLoading } = usePrivateProfile();
    const updateProfile = useUpdateProfile();

    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [website, setWebsite] = useState("");
    const [github, setGithub] = useState("");
    const [linkedin, setLinkedin] = useState("");

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState("");

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const initialized = useRef(false);
    useEffect(() => {
      if (!profile || initialized.current) return;
      initialized.current = true;
      setBio(profile.bio ?? "");
      setLocation(profile.location ?? "");
      setBirthDate(profile.birth_date ?? "");
      setWebsite(profile.website ?? "");
      setGithub(profile.github ?? "");
      setLinkedin(profile.linkedin ?? "");
    }, [profile]);

    const dirty =
      !!profile &&
      (bio !== (profile.bio ?? "") ||
        location !== (profile.location ?? "") ||
        birthDate !== (profile.birth_date ?? "") ||
        website !== (profile.website ?? "") ||
        github !== (profile.github ?? "") ||
        linkedin !== (profile.linkedin ?? "") ||
        !!avatarFile ||
        !!coverFile);

    useEffect(() => {
      onDirtyChange(dirty);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dirty]);

    function validateAndSetImage(file: File, kind: "avatar" | "cover") {
      if (file.size > MAX_IMAGE_SIZE) {
        setImageError("Image size must not exceed 10 MB.");
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setImageError("Unsupported image format. Use JPG, PNG or WEBP.");
        return;
      }
      setImageError("");
      const preview = URL.createObjectURL(file);
      if (kind === "avatar") {
        setAvatarFile(file);
        setAvatarPreview(preview);
      } else {
        setCoverFile(file);
        setCoverPreview(preview);
      }
    }

    useImperativeHandle(ref, () => ({
      async save() {
        await updateProfile.mutateAsync({
          bio,
          location,
          birth_date: birthDate || null,
          website,
          github,
          linkedin,
          avatarFile,
          coverFile,
        });
        setAvatarFile(null);
        setAvatarPreview(null);
        setCoverFile(null);
        setCoverPreview(null);
      },
      reset() {
        if (!profile) return;
        setBio(profile.bio ?? "");
        setLocation(profile.location ?? "");
        setBirthDate(profile.birth_date ?? "");
        setWebsite(profile.website ?? "");
        setGithub(profile.github ?? "");
        setLinkedin(profile.linkedin ?? "");
        setAvatarFile(null);
        setAvatarPreview(null);
        setCoverFile(null);
        setCoverPreview(null);
        setImageError("");
      },
    }));

    if (isLoading || !profile) {
      return <p className="text-center text-on-surface-variant py-12">Loading...</p>;
    }

    const avatarSrc = avatarPreview ?? mediaUrl(profile.avatar);
    const coverSrc = coverPreview ?? mediaUrl(profile.cover);

    return (
      <section className="space-y-8">
        <h2 className="font-headline-md text-[20px] text-on-surface border-b border-outline-variant/10 pb-4">
          Public Profile
        </h2>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <label className="font-label-sm text-on-surface-variant">Profile Pictures</label>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && validateAndSetImage(e.target.files[0], "cover")}
            />
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative w-full h-32 md:h-48 rounded-xl bg-surface-container overflow-hidden group cursor-pointer"
            >
              {coverSrc ? (
                <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-variant" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-on-primary font-label-sm flex items-center gap-2">
                  <span className="material-symbols-outlined">photo_camera</span> Change Cover
                </span>
              </div>
            </div>

            <div className="flex items-end -mt-12 md:-mt-16 ml-6 gap-4">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && validateAndSetImage(e.target.files[0], "avatar")}
              />
              <div
                onClick={() => avatarInputRef.current?.click()}
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-surface-container-lowest overflow-hidden group cursor-pointer bg-surface-variant flex items-center justify-center"
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[36px]">person</span>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-on-primary font-label-sm">
                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                  </span>
                </div>
              </div>
              <span className="text-xs text-on-surface-variant pb-2">Max 10MB — JPG, PNG, WEBP</span>
            </div>
            {imageError && <p className="text-error text-xs">{imageError}</p>}
          </div>

          <div className="space-y-2">
            <label className="font-label-sm text-on-surface-variant">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-on-surface-variant/40 min-h-[100px] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-sm text-on-surface-variant">Birthday</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-on-surface-variant"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-label-sm text-on-surface-variant uppercase tracking-wider">Social Links</h3>
            <div className="space-y-3">
              <div className="flex items-center relative">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">language</span>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Website URL"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 pl-10 pr-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
              <div className="flex items-center relative">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">code</span>
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="GitHub URL"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 pl-10 pr-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
              <div className="flex items-center relative">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">work</span>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="LinkedIn URL"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 pl-10 pr-3 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
