

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string; // 👈 add role to the User type
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string; // 👈 keep this
    } & DefaultSession["user"];
  }
}
