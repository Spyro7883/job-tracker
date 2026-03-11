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
          className="rounded-md bg-white px-4 py-2 text-sm text-black"
        >
          Open dashboard
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
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