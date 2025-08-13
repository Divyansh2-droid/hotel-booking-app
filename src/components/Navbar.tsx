import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold">
        StayQuest
      </Link>
      <div>
        {user ? (
          <>
            <Link href="/dashboard" className="mr-4 hover:underline">
              Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-indigo-800 px-3 py-1 rounded hover:bg-indigo-900 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="mr-4 hover:underline">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
