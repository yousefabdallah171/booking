import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CLIENT";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: "ADMIN" | "CLIENT";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "ADMIN" | "CLIENT";
    sub?: string;
  }
}
