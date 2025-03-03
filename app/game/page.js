import Board from "../../components/Board";

export default async function Game({ searchParams }) {
  const { mode } = await searchParams; // Await searchParams to resolve the Promise

  if (!mode) return <p className="text-white">Invalid mode</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-8 animate-pulse">
          Tic-Tac-Toe
        </h1>
        <Board mode={mode} />
      </div>
    </div>
  );
}