"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
}

export default function PlayerLoginPage() {
  const params = useParams();
  const router = useRouter();
  const { gameId } = params as { gameId: string };

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  // Add ref for the autocomplete container
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      const res = await fetch(`/api/games/${gameId}/status`);
      const data = await res.json();
      const allPlayers = [...data.alivePlayers, ...data.eliminatedPlayers]
        .filter((p) => !p.photoUrl)
        .sort((a, b) => a.name.localeCompare(b.name));
      setPlayers(allPlayers);
    };
    fetchPlayers();
  }, [gameId]);

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handlePlayerSelect = (player: Player) => {
    setSearchText(player.name);
    setSelectedPlayerId(player.id);
    setShowDropdown(false);
  };

  const uploadSelfie = async () => {
    if (!file || !selectedPlayerId) return;

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const photoUrl = data.url;

    await fetch(`/api/players/${selectedPlayerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl }),
    });

    setMessage("🎉 Selfie envoyé avec succès !");
    router.push(`/games/${gameId}/player/${selectedPlayerId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
        Authentification
      </h1>
      <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-3xl p-8 w-full max-w-xl border border-[#ff4ecd] shadow-[0_0_15px_rgba(255,78,205,0.3)] flex flex-col gap-6">
        <div className="relative" ref={autocompleteRef}>
          <input
            type="text"
            placeholder="🎭 Recherche ton nom"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full p-3 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)] hover:shadow-[0_0_20px_rgba(0,255,231,0.5)] hover:scale-105 transition-all duration-300"
          />
          {showDropdown && filteredPlayers.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-black border border-[#00ffe7] rounded-2xl shadow-lg max-h-60 overflow-auto">
              {filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className="w-full px-4 py-2 text-left text-[#00ffe7] hover:text-black hover:bg-[#00ffe7] transition-colors duration-200"
                >
                  {player.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPlayerId && (
          <>
            <div>
              <label
                htmlFor="selfie-upload"
                className="block mb-2 font-semibold text-lg text-[#ff4ecd] glow-text"
              >
                📸 Vérification par selfie
              </label>
              <label
                htmlFor="selfie-upload"
                className="flex items-center justify-center w-full p-3 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#7a5fff] shadow-[0_0_10px_rgba(122,95,255,0.3)] hover:shadow-[0_0_20px_rgba(122,95,255,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                📷 Envoyer photo
                <input
                  id="selfie-upload"
                  type="file"
                  accept="image/*"
                  title="Envoyez votre selfie"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              {file && (
                <p className="mt-2 text-center text-[#00ffe7]">
                  Photo sélectionnée: {file.name}
                </p>
              )}
            </div>
            <button
              onClick={uploadSelfie}
              disabled={!file}
              className={`font-bold px-6 py-3 rounded-full transition-all duration-300 ${
                file
                  ? "bg-[#ff4ecd] text-white shadow-[0_0_15px_rgba(255,78,205,0.4)] hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-110"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            >
              🚀 S&apos;authentifier
            </button>
          </>
        )}

        {message && (
          <p className="text-[#00ffe7] font-bold text-center animate-pulse glow-cyan">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
