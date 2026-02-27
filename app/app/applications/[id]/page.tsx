export default async function Page({
    params,
}: {
    params: { id: string } | Promise<{ id: string }>;
}) {
    const { id } = await Promise.resolve(params);

    return <div className="p-6">TODO: Application detail: {id}</div>;
}