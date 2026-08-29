import { Link } from "react-router-dom";
import { useUIStore } from "../../store/uiStore";
import { usePopularTags } from "../../hooks/usePopularTags";
import { GlassModal } from "../ui/GlassModal";

export function TagsModal() {
  const { tagsModalOpen, setTagsModal } = useUIStore();
  const { data: tags, isLoading } = usePopularTags();

  return (
    <GlassModal open={tagsModalOpen} onClose={() => setTagsModal(false)} title="All Tags">
      {isLoading && <p className="text-body-md text-on-surface-variant">Loading...</p>}
      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Link
            key={tag.id}
            to={`/?tag=${encodeURIComponent(tag.name)}`}
            onClick={() => setTagsModal(false)}
            className="px-4 py-1.5 border border-primary/20 bg-primary/5 rounded-full text-xs text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </GlassModal>
  );
}