import { signInAction } from "@/app/_lib/actions";
import { redirect } from "next/navigation";
import { auth } from "../_lib/auth";

export default async function LoginPage() {
  const session = await auth();
  const user = session?.user;

  if (user) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen mx-auto flex flex-col justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pretty text-text-primary mb-2">
            Log in with your Google account
          </h1>
        </div>

        <div className="bg-surface p-3 rounded-lg shadow-lg">
          <form action={signInAction}>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Log in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
