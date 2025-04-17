"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add ref for the autocomplete container
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Function to check if the device is mobile
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // Handle file selection and create preview
  const handleFileSelect = (file: File | null) => {
    setFile(file);
    
    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    // Create new preview
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Function to open camera with front camera as default for mobile
  const openCamera = () => {
    if (fileInputRef.current && isMobileDevice()) {
      // Set attributes for front camera on mobile devices
      fileInputRef.current.setAttribute("capture", "user");
    }
    
    // Trigger the file input click
    fileInputRef.current?.click();
  };

  useEffect(() => {
    // Cleanup function to revoke preview URLs when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
      const allPlayers = [...data.offlinePlayers]
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

    setIsLoading(true);
    setMessage("");
    
    try {
      const formData = new FormData();
      formData.append("gameId", gameId);  
      formData.append("file", file);
      const selectedPlayer = players.find(p => p.id === selectedPlayerId);
      if (selectedPlayer) {
        formData.append("name", selectedPlayer.name);
      }
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
    } catch (error) {
      console.error("Error uploading selfie:", error);
      setMessage("❌ Erreur lors de l'envoi du selfie. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
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
                className="block mb-2 font-semibold text-lg text-[#ff4ecd] glow-text text-center"
              >
                Vérification d&apos;identité
              </label>
              <button
                onClick={openCamera}
                className="flex items-center justify-center w-full p-3 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#7a5fff] shadow-[0_0_10px_rgba(122,95,255,0.3)] hover:shadow-[0_0_20px_rgba(122,95,255,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                📷 Envoyer un selfie
              </button>
              <input
                ref={fileInputRef}
                id="selfie-upload"
                type="file"
                accept="image/*"
                title="Envoyez votre selfie"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              {file && (
                <p className="mt-2 text-center text-[#00ffe7]">
                  Photo sélectionnée:
                </p>
              )}
            </div>

            {previewUrl && (
              <div className="flex justify-center mt-2">
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-[#00ffe7]">
                  <Image 
                    src={previewUrl} 
                    alt="Aperçu du selfie" 
                    fill 
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                  />
                </div>
              </div>
            )}

            <button
              onClick={uploadSelfie}
              disabled={!file || isLoading}
              className={`font-bold px-6 py-3 rounded-full transition-all duration-300 ${
                file && !isLoading
                  ? "bg-[#ff4ecd] text-white shadow-[0_0_15px_rgba(255,78,205,0.4)] hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-110"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              } flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                "🚀 S'authentifier"
              )}
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
