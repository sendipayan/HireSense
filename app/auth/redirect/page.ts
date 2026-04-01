import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AuthRedirect() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // First-time Google login → onboarding
  if (session.user.isNewUser) {
    redirect("/onBoarding/role");
  } else {
    redirect("/generate_cookie");
  }
}
