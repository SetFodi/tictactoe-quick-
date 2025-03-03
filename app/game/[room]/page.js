import Board from "../../../components/Board";

export default async function GameRoom({ params, searchParams }) {
  const { room } = await params; // Await params to resolve the Promise
  const { mode } = await searchParams; // Await searchParams

  if (mode !== "multi") return <p className="text-white">Invalid mode for room</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-8 animate-pulse">
          Tic-Tac-Toe (Room: {room})
        </h1>
        <Board mode="multi" room={room} />
      </div>
    </div>
  );
}