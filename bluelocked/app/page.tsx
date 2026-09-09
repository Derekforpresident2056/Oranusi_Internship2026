// app/page.tsx
import SquadViewer from "./components/SquadViewer";

export const revalidate = 0; // Ensures fresh data during dev

export default async function Page() {
  // Call your local API route!
  const res = await fetch("http://localhost:3000/api/characters", {
    cache: "no-store",
  });
  
  const { data: characters } = await res.json();

  // Look how clean this is! No database connection code or Mongoose logic needed here.
  return <SquadViewer characters={characters} />;
}