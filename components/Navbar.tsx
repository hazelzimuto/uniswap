import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          UniSwap
        </Link>
        <div className="flex space-x-4">
          <Link href="/listings" className="text-gray-600 hover:text-black">
            Browse
          </Link>
          {session ? (
            <>
              <Link href="/listings/new" className="text-gray-600 hover:text-black">
                Sell / Donate
              </Link>
              <div className="text-gray-600">Hi, {session.user?.name}</div>
              <Link href="/api/auth/signout" className="text-red-500 hover:text-red-700">
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-blue-500 hover:text-blue-700">
                Login
              </Link>
              <Link href="/register" className="text-blue-500 hover:text-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
