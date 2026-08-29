import { useMemo, useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}
interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: "Writing & Publishing",
    icon: "edit_note",
    items: [
      { q: "Does the editor support bold, links, or other formatting?", a: "Not yet — the story editor is a simple plain-text space for now. It's kept deliberately distraction-free." },
      { q: "Does StoryHub save my draft automatically?", a: "No — select \"Save as Draft\" while you're writing. You can pick it back up anytime from My Stories." },
      { q: "How many tags can I add to a story?", a: "As many as you like. Each tag just needs to be under 30 characters." },
      { q: "Is a cover image required?", a: "No, it's optional. If you add one, keep it under 10MB — JPG, PNG, or WEBP." },
    ],
  },
  {
    title: "Account & Security",
    icon: "shield_person",
    items: [
      { q: "How do I change my email address?", a: "Enter your new address in Settings → Email. We'll send a confirmation link there — your email only changes once you open it." },
      { q: "I signed up with Google. Can I add a password too?", a: "Yes — go to Settings → Password and set one. You'll then be able to sign in either way." },
      { q: "Can I delete my account?", a: "Yes, permanently, from Settings → Delete Account. This can't be undone, so we'll ask you to confirm your password first." },
    ],
  },
  {
    title: "Privacy",
    icon: "lock",
    items: [
      { q: "Who can see my birth date and location?", a: "No one but you. They stay private on your profile even though you're able to add them." },
      { q: "Can other people see what I've liked or saved?", a: "No — your likes and saved stories are visible only to you." },
    ],
  },
  {
    title: "Following & Notifications",
    icon: "group",
    items: [
      { q: "What happens when I follow someone?", a: "Their new stories start appearing in your Following feed, and they get notified that you followed them." },
      { q: "Can I turn off certain notifications?", a: "Not yet — notification preferences aren't available at the moment." },
    ],
  },
];

export function Help() {
  const [search, setSearch] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  // فلترة فورية: نبحث بنص السؤال والجواب معاً، ونخفي أي قسم يصير فاضي بالكامل
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FAQ_DATA;
    return FAQ_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <div className="w-full flex flex-col gap-12 max-w-[1200px] mx-auto items-center relative z-10">
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-12">
        <div className="text-center">
          <h1 className="font-display-lg text-[32px] text-primary mb-2">Help Center</h1>
          <p className="font-body-md text-on-surface-variant">
            Find answers to common questions and learn how to make the most of StoryHub.
          </p>
        </div>

        <div className="sticky top-20 z-30 w-full max-w-xl mx-auto py-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for help..."
              type="text"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-3 pl-12 pr-4 text-body-md focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {filtered.map((cat) => (
            <section key={cat.title}>
              <h2 className="font-headline-md text-[20px] text-primary mb-6 flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">{cat.icon}</span>
                </span>
                {cat.title}
              </h2>
              <div className="flex flex-col gap-3">
                {cat.items.map((item) => {
                  const key = `${cat.title}-${item.q}`;
                  const open = openKey === key;
                  return (
                    <div key={key} className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenKey(open ? null : key)}
                        className="w-full text-left p-5 flex justify-between items-center focus:outline-none hover:bg-surface-container-low transition-colors gap-4"
                      >
                        <span className="font-medium text-on-surface">{item.q}</span>
                        <span
                          className="material-symbols-outlined text-primary shrink-0 transition-transform duration-300"
                          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                        >
                          expand_more
                        </span>
                      </button>
                      <div
                        className="px-5 overflow-hidden transition-all duration-300 ease-in-out"
                        style={{ maxHeight: open ? "300px" : "0px", paddingBottom: open ? "20px" : "0px" }}
                      >
                        <p className="text-body-md text-on-surface-variant">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {!filtered.length && (
            <p className="text-center text-on-surface-variant py-10">No matching your search.</p>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-outline-variant/20 text-center">
          <p className="text-on-surface-variant mb-4">Still stuck?</p>
          <a
            href="mailto:support@storyhub.com"
            className="inline-block px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-sm hover:shadow-md transition-all"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}