import { Link } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import { usePopularTags } from "../../hooks/usePopularTags";
import { useUIStore } from "../../store/uiStore";

export function RightSidebar() {
  const { data: categories } = useCategories();
  const { data: tags } = usePopularTags();
  const { setCategoriesModal, setTagsModal } = useUIStore();

  const categoriesPreview = (categories ?? []).slice(0, 6);
  const tagsPreview = (tags ?? []).slice(0, 5);

  return (
    <aside
      className="hidden lg:flex flex-col h-full py-8 px-6 fixed right-0 top-0 w-[280px] bg-surface border-l border-outline-variant/10 z-50 overflow-y-auto pt-12 h-screen shadow-sm mt-16"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="mb-10">
        <h3 className="font-headline-md text-[14px] uppercase tracking-[0.2em] text-primary mb-6 font-bold bg-primary/10 backdrop-blur-md rounded-lg py-3 px-4 text-center border border-primary/10 shadow-sm">
          Categories
        </h3>
        <ul className="flex flex-col gap-5">
          {categoriesPreview.map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center py-2 px-3 -mx-3 rounded-lg text-body-md font-medium text-on-surface hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
              >
                <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 mr-3 transition-all duration-300 group-hover:scale-150" />
                {cat.name}
              </Link>
            </li>
          ))}
          <li className="mt-2 pt-4 border-t border-outline-variant/10">
            <button
              onClick={() => setCategoriesModal(true)}
              className="text-label-sm text-primary font-bold hover:text-primary/80 transition-colors flex items-center gap-2"
            >
              View all <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="h-px w-full bg-outline-variant/10 mb-10" />

      <div>
        <h3 className="font-headline-md text-[14px] uppercase tracking-[0.2em] text-primary mb-6 font-bold bg-primary/10 backdrop-blur-md rounded-lg py-3 px-4 text-center border border-primary/10 shadow-sm">
          Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {tagsPreview.map((tag) => (
            <Link
              key={tag.id}
              to={`/?tag=${encodeURIComponent(tag.name)}`}
              className="px-4 py-1.5 border border-primary/20 bg-primary/5 rounded-full text-xs text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
        <button
          onClick={() => setTagsModal(true)}
          className="text-label-sm text-primary font-bold hover:text-primary/80 transition-colors flex items-center gap-2"
        >
          View all <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
        </button>
      </div>
    </aside>
  );
}