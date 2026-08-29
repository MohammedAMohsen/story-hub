import { Link } from "react-router-dom";
import { useUIStore } from "../../store/uiStore";
import { useCategories } from "../../hooks/useCategories";
import { GlassModal } from "../ui/GlassModal";

export function CategoriesModal() {
  const { categoriesModalOpen, setCategoriesModal } = useUIStore();
  const { data: categories, isLoading } = useCategories();

  return (
    <GlassModal open={categoriesModalOpen} onClose={() => setCategoriesModal(false)} title="All Categories">
      {isLoading && <p className="text-body-md text-on-surface-variant">Loading...</p>}
      <div className="grid grid-cols-2 gap-2">
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            to={`/?category=${encodeURIComponent(cat.name)}`}
            onClick={() => setCategoriesModal(false)}
            className="px-4 py-3 rounded-xl bg-surface-container-low hover:bg-primary/10 hover:text-primary text-on-surface text-body-md font-medium transition-colors duration-200"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </GlassModal>
  );
}
