// authConfig.ts
import { api } from '@/service/api';
import { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { usePermissionStore } from '@/stores/auth.store';

const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const response = await api.post('/login', {
            email: credentials?.email,
            password: credentials?.password
          });

          const user = response.data.user;
          const accessToken = response.data.tokens?.access?.token;

          if (!accessToken || !user) {
            throw new Error('Authentication failed');
          }

          const permissions = user.role?.permissions || [];

          if (typeof window !== 'undefined') {
            usePermissionStore.getState().setPermissions(permissions);
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            roleType: user.roleType,
            token: accessToken,
            status: user.status
          } as User;
        } catch (error: unknown) {
         
          throw new Error(
            'Login failed. Please try again later.'
          );
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          roleType: user.roleType,
          accessToken: user.token,
        };
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as string,
        phone: token.phone as string,
        roleType: token.roleType as string,
        accessToken: token.accessToken as string,
        status: token.status as string,
        permissions: [] // empty here! will fetch separately
      };

      if (typeof window !== 'undefined' && token.permissions) {
        const permissionsArray = Array.isArray(token.permissions)
          ? token.permissions
          : [];
        usePermissionStore.getState().setPermissions(permissionsArray);
      }

      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60
  },
  events: {
    async signOut() {
      if (typeof window !== 'undefined') {
        usePermissionStore.getState().clearPermissions();
      }
    },
    async signIn({ user }) {
      if (user?.permissions && typeof window !== 'undefined') {
        usePermissionStore.getState().setPermissions(user.permissions);
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET
};

export default authConfig;
