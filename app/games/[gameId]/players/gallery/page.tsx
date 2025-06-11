import Image from "next/image";
import prisma from "../../../../../lib/prisma";
const getPlayers = async (gameId: string) => {
  const players = await prisma.player.findMany({
    where: { gameId, photoUrl: { not: "" } },
    orderBy: {
      kills: {
        _count: 'desc'
      }
    },
    select: {
      id: true,
      name: true,
      photoUrl: true,
      alive: true,
      _count: {
        select: {
          kills: true,
        },
      }
    },
  });
  return players;
};
export default async function GalleryPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const allPlayers = await getPlayers(gameId);
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Trombinoscope</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {allPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={player.photoUrl!}
                alt={`${player.name}'s photo`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-1">
              <div className="text-center text-sm font-medium text-gray-800">
                {player.name}
              </div>
              <div className="text-center text-xs text-gray-600">
                {player._count.kills} {player._count.kills === 1 ? 'assassinat' : 'assassinats'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
