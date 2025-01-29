import { auth } from "@/app/_lib/auth";
import Sidebar from "@/app/_components/Sidebar";
import ChatArea from "@/app/_components/ChatArea";
import { getUserById } from "@/app/_lib/data-service";
import SmallSidebar from "../_components/SmallSidebar";

export default async function Chat() {
  const { user } = await auth();

  const currentUserId = user.userId;
  const currentUser = await getUserById(currentUserId);

  return (
    <>
      <SmallSidebar />
      <Sidebar currentUser={currentUser} />
      <ChatArea currentUserId={currentUserId} />
    </>
  );
}
