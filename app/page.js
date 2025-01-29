import Image from "next/image";
import {
  MessageSquare,
  Shield,
  FileUp,
  Star,
  ArrowRightFromLine,
} from "lucide-react";
import Button from "./_components/Button";
import { auth } from "./_lib/auth";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex-1 min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[var(--surface)] border-b border-[var(--border)] z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/Chatoodle2-logo.png"
              alt="Chatoodle Logo"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold text-text-primary">
              Chatoodle
            </span>
          </div>

          <div className="flex items-center gap-4">
            {!user && (
              <Button variant="secondary" href="/login">
                Login
              </Button>
            )}
            <Button variant="primary" href="/chat">
              Chat
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary leading-tight">
              Connect instantly with your friends
            </h1>
            <p className="text-xl text-text-secondary">
              Experience seamless, user-friendly messaging that brings people
              together effortlessly.
            </p>
            <Button variant="primary" href="/chat">
              <span>Start Chatting Now</span>
              <ArrowRightFromLine className="ml-2 w-4 h-4" />
            </Button>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                    />
                  ))}
                </div>
                <div>
                  <div className="font-bold text-text-primary">22,861</div>
                  <div className="text-sm text-text-secondary">
                    Happy Customers
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-text-primary">4.8/5</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <= 4
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-text-secondary">Rating</div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-HE51SYz7MPgUWGGcFFV1sMS8rJPC8W.png"
              alt="Chat App Interface"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-[var(--surface)]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-16">
            Features for a better experience
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Video messaging
              </h3>
              <p className="text-text-secondary">
                Record and send video messages easily for direct and meaningful
                communication.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Keep safe & private
              </h3>
              <p className="text-text-secondary">
                Keep conversations secure with end-to-end encryption, ensuring
                privacy at all times.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <FileUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Quick File Sharing
              </h3>
              <p className="text-text-secondary">
                Share documents, photos, and videos instantly with quick file
                transfers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
