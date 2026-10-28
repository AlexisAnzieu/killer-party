import Link from "next/link";
import { Suspense } from "react";
import { isPrinterAvailable } from "@/lib/flyprint";

async function PrintGagesLink() {
  if (!(await isPrinterAvailable())) {
    return null;
  }

  return (
    <Link
      href="/gages"
      className="mt-6 inline-block underline underline-offset-4 font-semibold hover:text-yellow-300 transition-colors"
    >
      🖨️ Imprimer des gages
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12 bg-gradient-to-br from-purple-700 via-pink-500 to-yellow-400 text-white text-center animate-fade-in">
      <h1 className="text-6xl font-extrabold mb-4 drop-shadow-glow animate-pulse">
        Killer Party
      </h1>
      <p className="text-2xl mb-8 max-w-3xl font-medium">
        Le jeu social ultime de <span className="text-yellow-300 font-bold">stratégie</span>, <span className="text-green-300 font-bold">discrétion</span>, et de <span className="text-pink-300 font-bold">surprise</span>. Rassemblez vos amis, assignez des cibles secrètes, et voyez qui sera le dernier survivant !
      </p>
      <Link
        href="/games/new"
        className="inline-block bg-yellow-300 text-purple-800 font-bold px-8 py-4 rounded-full shadow-lg hover:scale-110 hover:bg-yellow-400 transition-transform duration-300 ease-out animate-bounce"
      >
        🎮 Démarrer une Nouvelle Partie
      </Link>
      {/* Only offer printing when the Flyprint printer answers. */}
      <Suspense fallback={null}>
        <PrintGagesLink />
      </Suspense>
    </div>
  );
}
