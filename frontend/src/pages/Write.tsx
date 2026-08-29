import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useCategories } from "../hooks/useCategories";
import { useStory } from "../hooks/useStory";
import { mediaUrl } from "../lib/media";
import { useClickOutside } from "../hooks/useClickOutside";

export function Write() {
  const { slug } = useParams();
  const isEditing = !!slug;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingStory, isLoading: isLoadingStory } = useStory(slug ?? "");
  const { data: categories } = useCategories();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  useClickOutside(categoryRef, () => setCategoryDropdownOpen(false));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing || !existingStory) return;
    setTitle(existingStory.title);
    setContent(existingStory.content);
    setTags(existingStory.tags ?? []);
    if (existingStory.cover) setExistingCoverUrl(mediaUrl(existingStory.cover) ?? null);
  }, [isEditing, existingStory]);

  useEffect(() => {
    if (!isEditing || !existingStory?.category || !categories?.length) return;
    const match = categories.find((c) => c.name === existingStory.category);
    if (match) setCategoryId(match.id);
  }, [isEditing, existingStory, categories]);

  function handleCoverSelect(file: File | null) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrors((e) => ({ ...e, cover: "Image size must not exceed 10 MB." }));
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setErrors((e) => ({ ...e, cover: "Only JPG, PNG, and WEBP formats are allowed." }));
      return;
    }
    setErrors((e) => ({ ...e, cover: "" }));
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setCoverRemoved(false);
  }

  function handleRemoveCover() {
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverUrl(null);
    setCoverRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (t.length > 30) {
      setErrors((e) => ({ ...e, tags: "A tag must not exceed 30 characters." }));
      return;
    }
    if (tags.includes(t)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagInput("");
    setErrors((e) => ({ ...e, tags: "" }));
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function handleSubmit(status: "Draft" | "Published") {
    setErrors({});
    if (!title.trim()) {
      setErrors({ title: "Story title is required." });
      return;
    }
    if (!content.trim()) {
      setErrors({ content: "Story content is required." });
      return;
    }

    setSubmitting(status === "Draft" ? "draft" : "publish");
    try {
      let response;
      if (coverFile) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        formData.append("status", status);
        if (categoryId) formData.append("category", String(categoryId));
        formData.append("cover", coverFile);

        response = isEditing
          ? await api.patch(`/api/stories/${slug}/`, formData, { headers: { "Content-Type": "multipart/form-data" } })
          : await api.post("/api/stories/", formData, { headers: { "Content-Type": "multipart/form-data" } });

        const slugForTags = (response.data as { slug?: string }).slug ?? slug;
        if (slugForTags) {
          response = await api.patch(`/api/stories/${slugForTags}/`, { tags });
        }
      } else {
        const payload: Record<string, unknown> = {
          title: title.trim(),
          content: content.trim(),
          status,
          category: categoryId,
          tags,
        };
        if (coverRemoved) payload.cover = null;

        response = isEditing
          ? await api.patch(`/api/stories/${slug}/`, payload)
          : await api.post("/api/stories/", payload);
      }

      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["my-stories"] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ["story", slug] });

      const finalSlug = (response.data as { slug?: string }).slug ?? slug;
      navigate(status === "Published" && finalSlug ? `/story/${finalSlug}` : "/my-stories");
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const flat: Record<string, string> = {};
        for (const key in data) flat[key] = Array.isArray(data[key]) ? data[key].join(" ") : String(data[key]);
        setErrors(flat);
      } else {
        setErrors({ general: "An unexpected error occurred. Please try again." });
      }
    } finally {
      setSubmitting(null);
    }
  }

  const selectedCategory = categories?.find((c) => c.id === categoryId);
  const charCount = content.length;
  const readTime = Math.max(1, Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200));
  const showCover = coverPreview ?? (!coverRemoved ? existingCoverUrl : null);

  if (isEditing && isLoadingStory) {
    return <p className="text-center text-on-surface-variant py-20 w-full">Loading...</p>;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      <div className="w-full max-w-[800px] bg-surface-container-lowest rounded-3xl p-8 md:p-12 shadow-sm min-h-[80vh] flex flex-col gap-6">
        <div className="mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-body-md group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span className="text-label-sm font-semibold uppercase tracking-wider">Back to feed</span>
          </button>
        </div>

        {errors.general && (
          <div className="bg-error/10 border border-error/20 text-error rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {errors.general}
          </div>
        )}

        <div>
          <label className="block text-sm font-bold text-on-surface mb-2 sr-only" htmlFor="story-title">Story Title</label>
          <div className="relative">
            <input
              id="story-title"
              maxLength={100}
              placeholder="Story Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full text-[28px] font-semibold text-on-surface focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant/40 outline-none transition-all pr-16 border rounded-xl px-4 py-3 bg-primary/5 backdrop-blur-sm ${
                errors.title ? "border-error/50" : "border-primary/10"
              }`}
            />
            <span className="absolute right-4 bottom-3 text-xs text-on-surface-variant">{title.length}/100</span>
          </div>
          {errors.title && <p className="text-error text-xs mt-1.5">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">
            Cover Image <span className="text-on-surface-variant font-normal">(Optional)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleCoverSelect(e.target.files?.[0] ?? null)}
          />
          {showCover ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden group">
              <img src={showCover} alt="Cover preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container-lowest/90 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="px-4 py-2 rounded-full bg-error/90 text-on-error text-sm font-semibold hover:bg-error transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group"
            >
              <span className="material-symbols-outlined text-[32px] group-hover:text-primary transition-colors">add_photo_alternate</span>
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Upload Cover Image</span>
              <span className="text-xs text-on-surface-variant/70">(Max 10MB — JPG, PNG, WEBP)</span>
            </button>
          )}
          {errors.cover && <p className="text-error text-xs mt-1.5">{errors.cover}</p>}
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="flex-1">
            <label className="block text-sm font-bold text-on-surface mb-2">
              Category <span className="text-on-surface-variant font-normal">(Optional)</span>
            </label>
            <div className="relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((o) => !o)}
                className="w-full flex items-center justify-between bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 text-body-md font-body-md hover:border-primary/30 hover:bg-primary/5 transition-all outline-none group"
              >
                <span className={selectedCategory ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                  {selectedCategory?.name ?? "Select a category"}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">expand_more</span>
              </button>
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl z-[120] overflow-hidden">
                  <div className="p-1 max-h-64 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId(null);
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-body-md text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      No category
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(cat.id);
                          setCategoryDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 rounded-lg text-body-md text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col h-full">
            <label className="block text-sm font-bold text-on-surface mb-2">
              Tags <span className="text-on-surface-variant font-normal">(Optional)</span>
            </label>
            <div className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all cursor-text min-h-[46px]">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                  #{t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                maxLength={30}
                placeholder="Add tags and press Enter"
                type="text"
                className="flex-1 bg-transparent border-none p-0 min-w-[120px] text-body-md focus:ring-0 outline-none placeholder:text-on-surface-variant/50"
              />
            </div>
            {errors.tags && <p className="text-error text-xs mt-1.5">{errors.tags}</p>}
          </div>
        </div>

        <div className="flex-1 flex flex-col mt-4">
          <label className="block text-sm font-bold text-on-surface mb-2 sr-only" htmlFor="story-content">Story Content</label>
          <textarea
            id="story-content"
            placeholder="Begin your narrative..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full flex-1 bg-transparent border-none p-0 text-body-lg font-body-lg text-on-surface-variant leading-relaxed focus:ring-0 outline-none resize-none min-h-[300px] placeholder:text-on-surface-variant/50 ${
              errors.content ? "ring-1 ring-error/40 rounded-lg p-2" : ""
            }`}
          />
          {errors.content && <p className="text-error text-xs mt-1.5">{errors.content}</p>}
          <div className="flex justify-end mt-2 text-xs text-on-surface-variant">
            <span>{charCount} characters</span>
            <span className="mx-2">•</span>
            <span>{readTime} min read</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/10">
          <button
            onClick={() => handleSubmit("Draft")}
            disabled={submitting !== null}
            className="px-6 py-2.5 rounded-full bg-surface-container border border-outline-variant/20 text-on-surface font-label-sm hover:bg-surface-container-high transition-all disabled:opacity-50"
          >
            {submitting === "draft" ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSubmit("Published")}
            disabled={submitting !== null}
            className="px-8 py-2.5 rounded-full bg-primary text-on-primary font-label-sm hover:bg-primary/90 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {submitting === "publish" ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}