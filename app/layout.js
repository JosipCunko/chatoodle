import GlobalContextProvider from "./_components/GlobalContextProvider";
import "@/app/_styles/globals.css";
import { Nunito } from "next/font/google";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Chatoodle - Connect instatly with your friends",
  description: "A simple chat application ",
};

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${nunito.className} w-full max-w-[2000px] mx-auto h-full border border-border`}
      >
        <GlobalContextProvider>
          <main className="flex h-full bg-background">{children}</main>
        </GlobalContextProvider>
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            style: {
              background: "var(--background)",
              color: "var(--text-primary)",
              fontSize: "16px",
              maxWidth: "500px",
              padding: "14px 22px",
            },
            success: {
              duration: 5000,
            },
            error: {
              duration: 5000,
            },
          }}
        />
      </body>
    </html>
  );
}
