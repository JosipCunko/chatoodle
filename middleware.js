import { auth } from "@/app/_lib/auth";

export const middleware = auth;

//Protected page
export const config = {
  matcher: ["/chat"],
};
