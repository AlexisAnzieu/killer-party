import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12 bg-gradient-to-br from-purple-700 via-pink-500 to-yellow-400 text-white text-center animate-fade-in">
      <h1 className="text-6xl font-extrabold mb-4 drop-shadow-glow animate-pulse">
        Killer Party
      </h1>
      <p className="text-2xl mb-8 max-w-3xl font-medium">
        The ultimate social game of <span className="text-yellow-300 font-bold">strategy</span>, <span className="text-green-300 font-bold">stealth</span>, and <span className="text-pink-300 font-bold">surprise</span>. Gather your friends, assign secret targets, and see who will be the last one standing!
      </p>
      <Link
        href="/games/new"
        className="inline-block bg-yellow-300 text-purple-800 font-bold px-8 py-4 rounded-full shadow-lg hover:scale-110 hover:bg-yellow-400 transition-transform duration-300 ease-out animate-bounce"
      >
        🎮 Start a New Game
      </Link>
    </div>
  );
}
