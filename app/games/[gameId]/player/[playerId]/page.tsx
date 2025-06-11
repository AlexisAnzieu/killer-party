"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Player as PrismaPlayer, Mission, GameStatus } from "@prisma/client";

type PlayerWithMission = PrismaPlayer & {
  mission?: Pick<Mission, "description">;
};

export default function PlayerDashboard() {
  const params = useParams();
  const { gameId, playerId } = params as { gameId: string; playerId: string };

  const [player, setPlayer] = useState<PlayerWithMission | null>(null);
  const [target, setTarget] = useState<PlayerWithMission | null>(null);
  const [killer, setKiller] = useState<PlayerWithMission | null>(null);
  const [victimCode, setVictimCode] = useState("");
  const [message, setMessage] = useState("");
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [assassinationCount, setAssassinationCount] = useState<number>(0);

  const fetchPlayer = async () => {
    const res = await fetch(`/api/players/${playerId}`);
    const data = await res.json();
    setPlayer(data);
    
    // If player is alive and has a target, fetch target info
    if (data.alive && data.targetId) {
      const targetRes = await fetch(`/api/players/${data.targetId}`);
      const targetData = await targetRes.json();
      setTarget(targetData);
    } 
    // If player is dead, fetch assassinations to see who killed them
    else if (!data.alive) {
      const assassinationsRes = await fetch(`/api/assassinations?victimId=${playerId}`);
      const assassinationsData = await assassinationsRes.json();
      if (assassinationsData.length > 0) {
        const killerRes = await fetch(`/api/players/${assassinationsData[0].killerId}`);
        const killerData = await killerRes.json();
        setKiller(killerData);
      }
    }
  };
  
  const fetchGameStatus = async () => {
    const res = await fetch(`/api/games/${gameId}/status`);
    const data = await res.json();
    setGameStatus(data.status);
  };

  const fetchAssassinationCount = async () => {
    const res = await fetch(`/api/assassinations?killerId=${playerId}`);
    const data = await res.json();
    setAssassinationCount(data.length);
  };
  
  useEffect(() => {
    fetchPlayer();
    fetchGameStatus();
    fetchAssassinationCount();
  }, [playerId, gameId]);

  const confirmKill = async () => {
    const res = await fetch("/api/assassinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, killerId: playerId, victimCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Assassinat confirmé !");
      // Reload player data and game status
      fetchPlayer();
      fetchGameStatus();
      fetchAssassinationCount();
    } else {
      setMessage(`❌ ${data.error || "Échec de la confirmation de l&apos;assassinat"}`);
    }
  };

  if (!player) return <div className="text-center text-white">Chargement...</div>;

  // Check if button should be disabled (not exactly 3 characters)
  const isButtonDisabled = victimCode.length !== 3;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-center">
        Tableau de Bord
      </h1>
      <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 w-full max-w-2xl mx-4 border border-[#ff4ecd] shadow-[0_0_15px_rgba(255,78,205,0.3)] flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-2 text-base sm:text-lg font-semibold">
          <p>🧑 <span className="text-[#00ffe7] glow-cyan">Votre Nom :</span> {player.name}</p>
          <p>🗡️ <span className="text-[#ff4ecd] glow-text">Score :</span> {assassinationCount} assassinat{assassinationCount !== 1 ? 's' : ''}</p>
          <p>🕵️ <span className="text-[#7a5fff] glow-purple">Code Secret :</span> {player.uniqueCode}</p>
          {player.alive && (
          <p>🎯 <span className="text-[#ff4ecd] glow-text">Mission :</span> {gameStatus === "NOT_STARTED" 
            ? "La partie n'a pas encore commencé." 
            : player.mission?.description}</p>)}
          
          {!player.alive && (
            <p className="mt-2 text-[#ff4ecd]">☠️ <span className="text-[#ff4ecd] glow-text">Status :</span> Éliminé</p>
          )}
        </div>

        {player.alive && (target ? (
          <>
            <div className="flex flex-col gap-2 mt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#00ffe7] glow-cyan">🎯 Votre Cible</h2>
              <p className="font-semibold pb-2">{target.name}</p>
              {target.photoUrl ? (
                <img
                  src={target.photoUrl}
                  alt="Selfie de la cible"
                  className="w-96 h-96 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-[#ff4ecd] shadow-[0_0_20px_rgba(255,78,205,0.5)] mx-auto"
                />
              ) : (
                <p>Pas encore de selfie téléchargé.</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2 mt-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#00ffe7] glow-cyan">🏆 Statut</h2>
            <p className="font-semibold pb-2">
              {gameStatus === "ENDED" 
                ? "Félicitations ! Vous avez gagné !" 
                : "Vous n'avez pas de cible pour le moment."}
            </p>
          </div>
        ))}

        {!player.alive && killer && (
          <>
            <div className="flex flex-col gap-2 mt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#ff4ecd] glow-text">☠️ Vous avez été tué par</h2>
              <p className="font-semibold pb-2">{killer.name}</p>
              {killer.photoUrl ? (
                <img
                  src={killer.photoUrl}
                  alt="Selfie du meurtrier"
                  className="w-96 h-96 sm:w-96 sm:h-96 object-cover rounded-full border-4 border-[#ff4ecd] shadow-[0_0_20px_rgba(255,78,205,0.5)] mx-auto"
                />
              ) : (
                <p>Pas de selfie disponible.</p>
              )}
            </div>
          </>
        )}

        {player.alive && (
          <div className="flex flex-col gap-4 mt-6">
            <input
              type="text"
              placeholder="Entrez le code de la victime"
              value={victimCode}
              onChange={(e) => setVictimCode(e.target.value)}
              className="p-3 rounded-full bg-black text-[#00ffe7] font-semibold border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)] hover:shadow-[0_0_20px_rgba(0,255,231,0.5)] hover:scale-105 transition-all duration-300 w-full text-center"
            />
            <button
              onClick={confirmKill}
              disabled={isButtonDisabled}
              className={`bg-[#ff4ecd] text-white font-bold px-6 py-4 rounded-full shadow-[0_0_15px_rgba(255,78,205,0.4)] transition-all duration-300 text-lg w-full sm:text-xl ${
                isButtonDisabled 
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-110"
              }`}
            >
              ☠️ Confirmer l&apos;Assassinat
            </button>
          </div>
        )}

        {message && (
          <p className="text-center font-bold mt-4 animate-pulse glow-text">{message}</p>
        )}
      </div>
    </div>
  );
}
