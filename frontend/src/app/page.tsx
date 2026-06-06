import { redirect } from "next/navigation";

import { PublicLandingPage } from "@/components/shared/PublicLandingPage";
import { auth } from "@/lib/auth";

export default async function RootPage() {
  const session = await auth();

  if (session?.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session?.user) {
    redirect("/booking");
  }

  return <PublicLandingPage />;
}
