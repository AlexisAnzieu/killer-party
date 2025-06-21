"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewGamePage() {
  const router = useRouter();
  const [gameName, setGameName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, setGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createGame = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gameName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      setGameId(data.gameId);
      router.push(`/games/${data.gameId}/status`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Une erreur est survenue lors de la création de la partie");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-center ">
        🎲 Créer une Nouvelle Partie
      </h1>
      <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 w-full max-w-2xl mx-4 border border-[#ff4ecd] shadow-[0_0_15px_rgba(255,78,205,0.3)] flex flex-col gap-4 sm:gap-6">
        <input
          type="text"
          placeholder="Nom de la partie (optionnel)"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          className="w-full p-3 sm:p-4 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)] hover:shadow-[0_0_20px_rgba(0,255,231,0.5)] hover:scale-105 transition-all duration-300 text-sm sm:text-base placeholder:text-[#00ffe7]/50"
        />
        {error && (
          <div className="text-red-500  text-sm font-medium bg-red-100/10 p-3 rounded-lg border border-red-500/50">
            ⚠️ {error}
          </div>
        )}
        <button
          onClick={createGame}
          disabled={isLoading}
          className="w-full px-6 py-4 bg-[#ff4ecd] text-white font-bold rounded-full shadow-[0_0_15px_rgba(255,78,205,0.4)] hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-105 transition-all duration-300 text-base sm:text-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? "⏳ Création en cours..." : "🚀 Créer la Partie"}
        </button>
      </div>
    </div>
  );
}
