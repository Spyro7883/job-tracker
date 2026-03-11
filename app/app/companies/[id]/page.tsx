import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import CompanyForm from "@/components/companies/company-form";
import Link from "next/link";
import DeleteCompanyButton from "@/components/companies/delete-company-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Page({
    params,
}: {
    params: { id: string } | Promise<{ id: string }>;
}) {
    const { id } = await Promise.resolve(params);

    const { userId } = await auth();
    if (!userId) return null;

    const company = await prisma.company.findFirst({ where: { id, userId } });
    if (!company) return <div className="p-6">Not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Edit company</h1>
                <div className="flex items-center gap-3">
                    <DeleteCompanyButton id={company.id} />
                    <Link className="underline" href="/app/companies">Back</Link>
                </div>
            </div>

            <div className="max-w-2xl rounded-xl border border-white/10 bg-white/5 p-6">
                <CompanyForm
                    mode="edit"
                    companyId={company.id}
                    initial={{
                        name: company.name,
                        website: company.website ?? "",
                        location: company.location ?? "",
                        notes: company.notes ?? "",
                    }}
                />
            </div>
        </div>
    );
}