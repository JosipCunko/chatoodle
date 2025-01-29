import { auth } from "@/app/_lib/auth";
import { getUserById } from "@/app/_lib/data-service";
import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import UpdateAccountForm from "@/app/_components/UpdateAccountForm";

export default async function AccountPage() {
  const { user } = await auth();

  const currentUserId = user.userId;
  const currentUser = await getUserById(currentUserId);

  return (
    <div className="flex-1 bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-surface rounded-lg overflow-hidden">
          {/* Profile Banner */}
          <div className="h-[60px] bg-primary" />

          <div className="p-4">
            <div className="relative -mt-16 mb-4">
              <div className="w-[80px] h-[80px] rounded-full border-[6px] border-surface overflow-hidden">
                {currentUser.avatar ? (
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-primary">
                      {currentUser.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Username Section */}
              <div>
                <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">
                  Username
                </h3>
                <div className="flex items-center justify-between p-2.5 bg-background rounded-[3px] hover:bg-accent/50 group">
                  <div>
                    <p className="font-medium text-sm">
                      {currentUser.username}
                    </p>
                    <p className="text-xs text-text-secondary">
                      #{currentUser.userId.toString().padStart(4, "0")}
                    </p>
                  </div>
                  <Link
                    href="https://myaccount.google.com/"
                    target="_blank"
                    className="p-2 rounded-[3px] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="h-4 w-4 text-text-secondary" />
                  </Link>
                </div>
              </div>

              {/* Email Section */}
              <div>
                <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">
                  Email
                </h3>
                <div className="flex items-center justify-between p-2.5 bg-background rounded-[3px] hover:bg-accent/50 group">
                  <div>
                    <p className="font-medium text-sm">{user.email}</p>
                  </div>
                  <Link
                    href="https://myaccount.google.com/"
                    target="_blank"
                    className="p-2 rounded-[3px] transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="h-4 w-4 text-text-secondary" />
                  </Link>
                </div>
              </div>

              {/* Phone Number Section */}
              <div>
                <h3 className="text-xs font-semibold text-text-secondary uppercase mb-2">
                  Phone Number
                </h3>
                <div className="flex items-center justify-between p-2.5 bg-background rounded-[3px] hover:bg-accent/50 group">
                  <UpdateAccountForm currentUser={currentUser} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
