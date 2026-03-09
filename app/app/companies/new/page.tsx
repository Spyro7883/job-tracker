import { auth } from "@clerk/nextjs/server";
import CompanyForm from "@/components/companies/company-form";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page() {
    const { userId } = await auth();
    if (!userId) return null;

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold">New company</h1>
            <div className="mt-6 max-w-2xl">
                <CompanyForm mode="create" />
            </div>
        </div>
    );
}