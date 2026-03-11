import { auth } from "@clerk/nextjs/server";
import CompanyForm from "@/components/companies/company-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page() {
    const { userId } = await auth();
    if (!userId) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold">New company</h1>
            <div className="max-w-2xl rounded-xl border border-white/10 bg-white/5 p-6">
                <CompanyForm mode="create" />
            </div>
        </div>
    );
}