import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
            <header className="border-b border-black/10 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-zinc-950/60">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <nav className="flex items-center gap-4">
                        <Link className="font-semibold" href="/app/applications">
                            Job Tracker
                        </Link>
                        <Link className="text-sm opacity-70 hover:opacity-100" href="/app/applications">
                            Applications
                        </Link>
                        <Link className="text-sm opacity-70 hover:opacity-100" href="/app/companies">
                            Companies
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <UserButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
        </div>
    );
}