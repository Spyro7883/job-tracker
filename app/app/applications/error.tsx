"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm opacity-70">{error.message}</p>
            <button
                className="mt-4 rounded-md border px-3 py-2 text-sm hover:bg-white/5"
                onClick={() => reset()}
            >
                Retry
            </button>
        </div>
    );
}