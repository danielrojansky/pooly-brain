import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().email() }).safeParse(credentials);
        if (!parsed.success) return null;

        const { email } = parsed.data;
        try {
          const { db } = await import('./db');
          await db`
            INSERT INTO users (email) VALUES (${email})
            ON CONFLICT (email) DO NOTHING
          `;
          const rows = await db`SELECT id, email FROM users WHERE email = ${email}`;
          const user = rows.rows[0];
          if (!user) return null;
          return { id: user.id, email: user.email, name: email.split('@')[0] };
        } catch {
          // DB not available — return mock user for demo
          return { id: 'demo-user', email, name: email.split('@')[0] };
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        (session.user as unknown as Record<string, unknown>).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
});
