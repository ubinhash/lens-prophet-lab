import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "../../public/globals.css";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lens App",
  description: "Future of decentralized social",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0 overflow-hidden`}>
        <Providers>
          <div>
            <div className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm border-b z-10 p-4">
              <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">Lens Starter</h1>
                <div className="flex items-center gap-4">
                  <Link href="https://lens.xyz/docs" target="_blank" className="text-primary hover:underline">
                    Docs
                  </Link>
                  <Link href="https://developer.lens.xyz/apps" target="_blank" className="text-primary hover:underline">
                    Create an App
                  </Link>
                  <ThemeToggle />
                </div>
              </div>
            </div>

            <main className="h-screen w-screen overflow-auto bg-background pt-16">
              <div className="max-w-7xl mx-auto p-4">
                <div className="mb-8 pb-8 border-b">
                  <h2 className="text-2xl font-bold mb-4">Welcome to Lens Starter Template!</h2>
                  <p className="mb-4">
                    A template for building decentralized social applications on Lens Protocol.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
                      <ol className="list-decimal list-inside space-y-2">
                        <li>Create a Lens app at <a href="https://developer.lens.xyz/apps" target="_blank" className="text-primary hover:underline">developer.lens.xyz/apps</a></li>
                        <li>Copy your App ID to the <code className="bg-muted px-1 rounded">.env</code> file</li>
                        <li>Login with your lens account below</li>
                      </ol>
                    </div>
                  </div>
                </div>
                {children}
              </div>
            </main></div>
        </Providers>
      </body>
    </html>
  );
}
