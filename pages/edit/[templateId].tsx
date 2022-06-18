import TemplateForm from "components/TemplateForm";
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

export default function EditTemplate() {
  const router = useRouter();
  const { templateId } = router.query;
  const { walletAddress, disconnect } = useSigningClient();
  const casted = Number.parseInt(templateId as string);
  if (Number.isNaN(casted)) {
    return <div>Error</div>;
  }
  return (
    <WalletLoader>
      <div className="w-full flex justify-center">
        <div className="w-1/2">
          <h1 className="text-3xl">Editing Template {templateId}</h1>

          <small className="pb-2 hover:underline" style={{ cursor: "pointer" }}>
            <Link href="/">Home</Link>
          </small>
          <div
            className="border-4 p-2 m-2"
            onClick={(e) => disconnect()}
            style={{ cursor: "pointer" }}
          >
            <p>Connected as: {walletAddress}</p>
          </div>
          <TemplateForm templateId={casted} onCreate={() => {}} />
        </div>
      </div>
    </WalletLoader>
  );
}
