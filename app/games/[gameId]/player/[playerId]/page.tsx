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
      setMessage("✅ Assassination confirmed!");
    } else {
      setMessage(`❌ ${data.error || "Failed to confirm assassination"}`);
    }
  };

  if (!player) return <div className="text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-purple-800 via-pink-600 to-yellow-400 text-white animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-glow animate-pulse text-center">
        Player Dashboard
      </h1>
      <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 w-full max-w-2xl shadow-lg flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-lg font-semibold">
          <p>🧑 <span className="text-yellow-300">Your Name:</span> {player.name}</p>
          <p>🕵️ <span className="text-green-300">Secret Code:</span> {player.uniqueCode}</p>
          <p>🎯 <span className="text-pink-300">Mission:</span> {player.mission?.description}</p>
        </div>

        {target && (
          <>
            <div className="flex flex-col gap-2 mt-6">
              <h2 className="text-2xl font-bold">🎯 Your Target</h2>
              <p className="font-semibold">{target.name}</p>
              {target.photoUrl ? (
                <img
                  src={target.photoUrl}
                  alt="Target selfie"
                  className="w-32 h-32 object-cover rounded-full border-4 border-yellow-300 mx-auto"
                />
              ) : (
                <p>No selfie uploaded yet.</p>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-4 mt-6">
          <input
            type="text"
            placeholder="Enter victim's secret code"
            value={victimCode}
            onChange={(e) => setVictimCode(e.target.value)}
            className="p-3 rounded-full text-black font-semibold shadow hover:scale-105 transition-transform"
          />
          <button
            onClick={confirmKill}
            className="bg-red-500 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:scale-110 hover:bg-red-600 transition-transform duration-300 ease-out"
          >
            ☠️ Confirm Kill
          </button>
        </div>

        {message && (
          <p className="text-center font-bold mt-4 animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
}
