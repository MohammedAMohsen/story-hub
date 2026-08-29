interface Props {
  show: boolean;
}

export function MessageComingSoon({ show }: Props) {
  if (!show) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[250] bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <span className="material-symbols-outlined text-[18px]">construction</span>
      <span className="text-body-md">Messaging is coming soon — still under development.</span>
    </div>
  );
}
