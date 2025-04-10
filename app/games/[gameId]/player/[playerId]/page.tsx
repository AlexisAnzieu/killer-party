"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Player as PrismaPlayer, Mission } from "@prisma/client";

type PlayerWithMission = PrismaPlayer & {
  mission?: Pick<Mission, "description">;
};

export default function PlayerDashboard() {
  const params = useParams();
  const { gameId, playerId } = params as { gameId: string; playerId: string };

  const [player, setPlayer] = useState<PlayerWithMission | null>(null);
  const [target, setTarget] = useState<PlayerWithMission | null>(null);
  const [victimCode, setVictimCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPlayer = async () => {
      const res = await fetch(`/api/players/${playerId}`);
      const data = await res.json();
      setPlayer(data);
      if (data.targetId) {
        const targetRes = await fetch(`/api/players/${data.targetId}`);
        const targetData = await targetRes.json();
        setTarget(targetData);
      }
    };
    fetchPlayer();
  }, [playerId]);


  const confirmKill = async () => {
    const res = await fetch("/api/assassinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, killerId: playerId, victimCode }),
    });
    const data = await res.json();
      if (res.ok) {
      setMessage("✅ Assassinat confirmé !");
    } else {
      setMessage(`❌ ${data.error || "Échec de la confirmation de l&apos;assassinat"}`);
    }
  };

  if (!player) return <div className="text-center text-white">Chargement...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-center">
        Tableau de Bord
      </h1>
      <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 w-full max-w-2xl mx-4 border border-[#ff4ecd] shadow-[0_0_15px_rgba(255,78,205,0.3)] flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-2 text-base sm:text-lg font-semibold">
          <p>🧑 <span className="text-[#00ffe7] glow-cyan">Votre Nom :</span> {player.name}</p>
          <p>🕵️ <span className="text-[#7a5fff] glow-purple">Code Secret :</span> {player.uniqueCode}</p>
          <p>🎯 <span className="text-[#ff4ecd] glow-text">Mission :</span> {player.mission?.description}</p>
        </div>

        {target && (
          <>
            <div className="flex flex-col gap-2 mt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#00ffe7] glow-cyan">🎯 Votre Cible</h2>
              <p className="font-semibold">{target.name}</p>
              {target.photoUrl ? (
                <img
                  src={target.photoUrl}
                  alt="Selfie de la cible"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-[#ff4ecd] shadow-[0_0_20px_rgba(255,78,205,0.5)] mx-auto"
                />
              ) : (
                <p>Pas encore de selfie téléchargé.</p>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-4 mt-6">
          <input
            type="text"
            placeholder="Entrez le code secret de la victime"
            value={victimCode}
            onChange={(e) => setVictimCode(e.target.value)}
            className="p-3 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)] hover:shadow-[0_0_20px_rgba(0,255,231,0.5)] hover:scale-105 transition-all duration-300 w-full text-center"
          />
          <button
            onClick={confirmKill}
            className="bg-[#ff4ecd] text-white font-bold px-6 py-4 rounded-full shadow-[0_0_15px_rgba(255,78,205,0.4)] hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-110 transition-all duration-300 text-lg w-full sm:text-xl"
          >
            ☠️ Confirmer l&apos;Assassinat
          </button>
        </div>

        {message && (
          <p className="text-center font-bold mt-4 animate-pulse glow-text">{message}</p>
        )}
      </div>
    </div>
  );
}
