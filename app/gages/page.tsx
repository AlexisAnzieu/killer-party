"use client";

import { useState } from "react";
import { FLYPRINT_URL } from "@/lib/flyprint";

const MAX_GAGES = 100;

export default function PrintGagesPage() {
  const [count, setCount] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = Number.isInteger(count) && count >= 1 && count <= MAX_GAGES;

  const printGages = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch(`${FLYPRINT_URL}/api/print-killer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
        return;
      }

      setSuccess(`${data.printed} gages envoyés à l'imprimante !`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError(
        "Impossible de joindre l'imprimante. Vérifiez qu'elle est allumée et connectée."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-[#0d0221] via-[#ff4ecd] to-[#00ffe7] bg-opacity-20 text-white">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-center">
        🖨️ Imprimer des Gages
      </h1>
      <p className="text-center text-sm sm:text-base mb-6 max-w-xl">
        Choisissez combien de gages imprimer. Chaque gage sort sur son propre
        ticket prédécoupé : il suffit de les détacher et de les distribuer.
      </p>
      <div className="bg-black bg-opacity-50 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 w-full max-w-2xl mx-4 border border-[#ff4ecd] shadow-[0_0_15px_rgba(255,78,205,0.3)] flex flex-col gap-4 sm:gap-6">
        <label htmlFor="count" className="text-sm sm:text-base font-semibold">
          Nombre de gages (1 à {MAX_GAGES})
        </label>
        <input
          id="count"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_GAGES}
          value={Number.isNaN(count) ? "" : count}
          onChange={(e) => setCount(parseInt(e.target.value, 10))}
          className="w-full p-3 sm:p-4 rounded-full bg-black text-[#00ffe7] text-center text-2xl font-semibold border border-[#00ffe7] shadow-[0_0_10px_rgba(0,255,231,0.3)] hover:shadow-[0_0_20px_rgba(0,255,231,0.5)] transition-all duration-300"
        />
        {error && (
          <div className="text-red-500 text-sm font-medium bg-red-100/10 p-3 rounded-lg border border-red-500/50">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="text-[#00ffe7] text-sm font-medium bg-[#00ffe7]/10 p-3 rounded-lg border border-[#00ffe7]/50">
            ✅ {success}
          </div>
        )}
        <button
          onClick={printGages}
          disabled={isLoading || !isValid}
          className="w-full px-6 py-4 bg-[#ff4ecd] text-white font-bold rounded-full shadow-[0_0_15px_rgba(255,78,205,0.4)] hover:shadow-[0_0_30px_rgba(255,78,205,0.6)] hover:scale-105 transition-all duration-300 text-base sm:text-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading
            ? "⏳ Impression en cours..."
            : `🖨️ Imprimer ${isValid ? count : ""} gage${count > 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
