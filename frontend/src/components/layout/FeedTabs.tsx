import { useSearchParams } from "react-router-dom";

export function FeedTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("feed") === "following" ? "following" : "for-you";

  function goTo(next: "for-you" | "following") {
    const params = new URLSearchParams(searchParams);
    if (next === "for-you") params.delete("feed");
    else params.set("feed", "following");
    setSearchParams(params);
  }

  return (
    <div className="sticky top-16 z-40 flex justify-center w-full py-2 -mt-2">
      <div className="flex bg-surface-container-lowest/80 backdrop-blur-md rounded-full shadow-sm p-1 border border-outline-variant/10 w-80 max-w-md mx-auto relative">
        <div
          className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-300 ease-in-out z-0"
          style={{ transform: tab === "for-you" ? "translateX(0)" : "translateX(100%)" }}
        />
        <button
          onClick={() => goTo("for-you")}
          className={`relative z-10 px-8 py-2.5 rounded-full text-center font-label-sm text-label-sm transition-colors flex-1 ${
            tab === "for-you" ? "text-on-primary" : "text-on-surface-variant"
          }`}
        >
          For You
        </button>
        <button
          onClick={() => goTo("following")}
          className={`relative z-10 px-8 py-2.5 rounded-full text-center font-label-sm text-label-sm transition-colors flex-1 ${
            tab === "following" ? "text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Following
        </button>
      </div>
    </div>
  );
}
