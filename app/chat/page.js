import { auth } from "@/app/_lib/auth";
import Sidebar from "@/app/_components/Sidebar";
import ChatArea from "@/app/_components/ChatArea";
import { getUserById } from "@/app/_lib/data-service";
import SmallSidebar from "../_components/SmallSidebar";

export default async function Chat() {
  const { user } = await auth();
  if (!user) throw new Error("You must be logged in");

  const currentUserId = user.userId;
  const currentUser = await getUserById(currentUserId);

  return (
    <>
      <SmallSidebar currentUserId={currentUserId} />
      <Sidebar currentUser={currentUser} />
      <ChatArea currentUserId={currentUserId} currentUser={currentUser} />
    </>
  );
}
