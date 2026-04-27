import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const { db } = await import('./db');
          await db`
            INSERT INTO users (email, name, image, google_id)
            VALUES (${user.email}, ${user.name ?? null}, ${user.image ?? null}, ${account.providerAccountId})
            ON CONFLICT (email) DO UPDATE
            SET name = EXCLUDED.name, image = EXCLUDED.image, google_id = EXCLUDED.google_id
          `;
        } catch {
          // DB not available in mock mode
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          const { db } = await import('./db');
          const rows = await db`SELECT id FROM users WHERE email = ${session.user.email}`;
          const row = rows.rows[0];
          if (row) (session.user as unknown as Record<string, unknown>).id = row.id;
        } catch {
          // DB not available in mock mode
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
