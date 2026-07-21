'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="ml-auto border border-red-200 text-red-500 font-bold text-sm px-4 py-2 rounded-sm hover:bg-red-50"
    >
      Logout
    </button>
  );
}
