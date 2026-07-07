import { useEffect, useRef, useState } from "react";
import type { Exhibit } from "./lib/types";
import { deleteExhibit, loadExhibits, saveExhibit } from "./lib/store";
import { Home } from "./views/Home";
import { Editor } from "./views/Editor";

type Route = { view: "home" } | { view: "editor"; id: string };

export default function App() {
  const [exhibits, setExhibits] = useState<Exhibit[] | null>(null);
  const [route, setRoute] = useState<Route>({ view: "home" });
  const saveTimers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    loadExhibits()
      .then(setExhibits)
      .catch((err) => {
        console.error(err);
        setExhibits([]);
      });
  }, []);

  /** Update state immediately; persist to IndexedDB debounced per exhibit. */
  function upsert(exhibit: Exhibit) {
    setExhibits((prev) => {
      if (!prev) return prev;
      const i = prev.findIndex((e) => e.id === exhibit.id);
      return i < 0 ? [...prev, exhibit] : prev.map((e) => (e.id === exhibit.id ? exhibit : e));
    });
    const timers = saveTimers.current;
    const pending = timers.get(exhibit.id);
    if (pending) window.clearTimeout(pending);
    timers.set(
      exhibit.id,
      window.setTimeout(() => {
        timers.delete(exhibit.id);
        saveExhibit(exhibit).catch((err) => console.error("Save failed:", err));
      }, 400),
    );
  }

  function remove(id: string) {
    setExhibits((prev) => prev?.filter((e) => e.id !== id) ?? prev);
    deleteExhibit(id).catch((err) => console.error("Delete failed:", err));
    if (route.view === "editor" && route.id === id) setRoute({ view: "home" });
  }

  if (exhibits === null) return null; // one frame while IndexedDB loads

  if (route.view === "editor") {
    const exhibit = exhibits.find((e) => e.id === route.id);
    if (exhibit) {
      return <Editor exhibit={exhibit} onChange={upsert} onBack={() => setRoute({ view: "home" })} />;
    }
  }

  return (
    <Home
      exhibits={exhibits}
      onOpen={(id) => setRoute({ view: "editor", id })}
      onCreate={(exhibit) => {
        upsert(exhibit);
        setRoute({ view: "editor", id: exhibit.id });
      }}
      onDelete={remove}
    />
  );
}
