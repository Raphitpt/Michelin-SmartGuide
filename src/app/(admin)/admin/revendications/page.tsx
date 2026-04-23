import { listClaimsAction } from "@/lib/admin/actions";
import ClaimsClient from "@/components/admin/ClaimsClient";

export default async function RevendicationsPage() {
  const claims = await listClaimsAction("all");

  return (
    <div className="space-y-4 pt-2">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Revendications</h1>
        <p className="text-sm text-gray-500">
          Gérez les demandes de revendication de restaurant
        </p>
      </div>
      <ClaimsClient claims={claims as Parameters<typeof ClaimsClient>[0]["claims"]} />
    </div>
  );
}
