import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-6xl font-bold tracking-tight">UniVibe</h1>
      <p className="text-xl text-gray-400">Your college, in one place.</p>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition font-medium"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition font-medium"
        >
          Login
        </Link>
      </div>
    </main>
  );
}