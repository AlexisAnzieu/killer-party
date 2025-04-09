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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      const photoUrl = uploadData.url;

      // Update player with selfie URL
      await fetch(`/api/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl }),
      });

      // Trigger target assignment
      await fetch(`/api/games/${gameId}/assign`, { method: "POST" });
      setMessage("Selfie uploaded and targets assigned!");
    } catch (error) {
      console.error(error);
      setMessage("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const confirmKill = async () => {
    const res = await fetch("/api/assassinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, killerId: playerId, victimCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Assassination confirmed!");
    } else {
      setMessage(data.error || "Failed to confirm assassination");
    }
  };

  if (!player) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Player Dashboard</h1>
      <p className="mb-2"><strong>Your Name:</strong> {player.name}</p>
      <p className="mb-2"><strong>Your Secret Code:</strong> {player.uniqueCode}</p>
      <p className="mb-2"><strong>Your Mission:</strong> {player.mission?.description}</p>
      {target && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Upload Your Selfie</h2>
            <input
              type="file"
              accept="image/*"
              aria-label="Upload your selfie"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-2"
            />
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
            >
              {uploading ? "Uploading..." : "Upload Selfie"}
            </button>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Your Target</h2>
            <p><strong>Name:</strong> {target.name}</p>
            {target.photoUrl ? (
              <img
                src={target.photoUrl}
                alt="Target selfie"
                className="w-32 h-32 object-cover rounded-full mb-2"
              />
            ) : (
              <p>No selfie uploaded yet.</p>
            )}
          </div>
        </>
      )}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Victim's secret code"
          value={victimCode}
          onChange={(e) => setVictimCode(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button onClick={confirmKill} className="bg-red-500 text-white px-4 py-2 rounded">
          Confirm Kill
        </button>
      </div>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
