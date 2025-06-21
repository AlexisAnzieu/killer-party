"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function PlayerLoginPage() {
  const params = useParams();
  const router = useRouter();
  const { gameId } = params as { gameId: string };

  const [playerName, setPlayerName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleFileSelect = (file: File | null) => {
    setFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const openCamera = () => {
    if (fileInputRef.current && isMobileDevice()) {
      fileInputRef.current.setAttribute("capture", "user");
    }
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    const checkGameStatus = async () => {
      const res = await fetch(`/api/games/${gameId}/status`);
      const data = await res.json();
      if (data.status !== "NOT_STARTED") {
        setGameStarted(true);
      }
    };
    checkGameStatus();
  }, [gameId]);

  const createPlayer = async () => {
    if (!file || !playerName.trim()) return;

    setIsLoading(true);
    setMessage("");

    try {
      // Generate a unique code (3 random uppercase letters)
      const uniqueCode = Array.from({ length: 3 }, () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26))
      ).join("");

      // First, create the player with a temporary entry
      const playerRes = await fetch(`/api/games/${gameId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: playerName.trim(),
          uniqueCode,
        }),
      });

      if (!playerRes.ok) {
        throw new Error("Failed to create player");
      }

      const { playerId } = await playerRes.json();

      // Then upload the photo
      const formData = new FormData();
      formData.append("gameId", gameId);
      formData.append("file", file);
      formData.append("name", playerName.trim());

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload photo");
      }

      const { url: photoUrl } = await uploadRes.json();

      // Finally, update the player with the photo URL
      await fetch(`/api/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl }),
      });

      setMessage("🎉 Inscription réussie !");
      router.push(`/games/${gameId}/player/${playerId}`);
    } catch (error) {
      console.error("Error creating player:", error);
      setMessage("❌ Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
        Rejoindre la Partie
      </h1>
      <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-3xl p-8 w-full max-w-xl border border-[#ff4ecd] shadow-[0_0_15px_rgba(255,78,205,0.3)] flex flex-col gap-6">
        {gameStarted ? (
          <div className="text-[#ff4ecd] font-bold text-xl text-center">
            La session a démarré, inscription impossible en cours de jeu
          </div>
        ) : (
          <>
            <div>
              <input
                type="text"
                placeholder="🎭 Entre ton nom"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)] hover:shadow-[0_0_20px_rgba(0,255,231,0.5)] hover:scale-105 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-lg text-[#ff4ecd] glow-text text-center">
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
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                className="hidden"
                id="selfie-upload"
                name="selfie"
                title="Sélectionner une photo"
                aria-label="Sélectionner une photo de profil"
              />
              {file && (
                <p className="mt-2 text-center text-[#00ffe7]">
                  Photo sélectionnée
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
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
              </div>
            )}

            <button
              onClick={createPlayer}
              disabled={!file || !playerName.trim() || isLoading}
              className={`font-bold px-6 py-3 rounded-full transition-all duration-300 ${
                file && playerName.trim() && !isLoading
                  ? "bg-[#ff4ecd] text-white shadow-[0_0_15px_rgba(255,78,205,0.4)] hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-110"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              } flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Inscription en cours...
                </>
              ) : (
                "🚀 Rejoindre la partie"
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
