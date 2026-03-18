import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Job Tracker</h1>
      <p className="mt-4 text-lg opacity-80">
        Track job applications, statuses, and follow-up reminders.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/app/applications"
          className="rounded-md border border-black/10 bg-black px-4 py-2 text-sm text-white hover:bg-black/90 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          Open dashboard
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md border border-black/10 bg-white px-4 py-2 text-sm text-black hover:bg-black/5 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5"
        >
          Sign in
        </Link>
      </div>

      <ul className="mt-10 grid gap-3 text-sm opacity-80">
        <li>• Applications table: search, filter, sort, pagination</li>
        <li>• Company management</li>
        <li>• Follow-up reminders + upcoming widget</li>
      </ul>
    </main>
  );
}