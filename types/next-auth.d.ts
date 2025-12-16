// types/next-auth.d.ts
// biome-ignore lint/correctness/noUnusedVariables: Interface type parameters required by @tanstack/react-table
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name: string;
      roleType: string;
      role: string;
      phone: string;
      email: string;
      status: string;
      accessToken: string;
      permissions: string[]; // Include permissions in session if needed
    };
  }

  interface User {
    id: string;
    name: string;
    role: string;
    phone: string;
    roleType: string;
    email: string;
    status: string;
    token?: string;
    permissions?: string[]; // Include permissions in user if needed
  }
}
