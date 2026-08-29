export function SaveBanner({
  visible,
  saving,
  onCancel,
  onSave,
}: {
  visible: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (!visible) return null;

  return (
    <div className="sticky top-20 z-50 bg-surface-container-lowest border border-primary/20 shadow-md rounded-lg p-4 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
      <span className="text-body-md text-on-surface">You have unsaved changes.</span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
