import type { NextPage } from "next";
import Link from "next/link";
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import { useEffect, useState } from "react";
import TemplateForm from "components/TemplateForm";
import TemplateListItem from "components/TemplateListItem";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIERLIST_ADDRESS || "";
const LIMIT = 10;

const Home: NextPage = () => {
  const { signingClient, walletAddress, disconnect } = useSigningClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [templates, setTemplates] = useState<[number, any][]>();
  const [config, setConfig] = useState<any>({ admin_address: "" });
  useEffect(() => {
    const main = async () => {
      const templates: [number, any][] =
        await signingClient?.queryContractSmart(CONTRACT_ADDRESS, {
          templates: {
            start_after: (currentPage - 1) * 10,
            limit: 10,
          },
        });
      const config: { admin_address: string } =
        await signingClient?.queryContractSmart(CONTRACT_ADDRESS, {
          config: {},
        });
      setConfig(config);
      setTemplates(templates);
    };
    main();
  }, [signingClient, currentPage]);

  const deleteTemplate = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();

    const msg = {
      delete_template: {
        id,
      },
    };
    try {
      await signingClient?.execute(
        walletAddress,
        CONTRACT_ADDRESS,
        msg,
        "auto"
      );
      // Call on create to refresh list
      onCreate();
    } catch (err) {
      console.error(err);
    }
  };

  const onCreate = async () => {
    const templates: [number, any][] = await signingClient?.queryContractSmart(
      CONTRACT_ADDRESS,
      {
        templates: {
          start_after: (currentPage - 1) * LIMIT,
          limit: null,
        },
      }
    );
    setTemplates(templates);
  };

  const nextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage(currentPage + 1);
    onCreate();
  };

  const previousPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
      onCreate();
    }
  };

  return (
    <WalletLoader>
      <div className="w-full flex justify-center">
        <div className="w-1/2">
          <h1 className="text-3xl">Cosmwasm Tierlist</h1>
          <div
            className="border-4 p-2 m-2"
            onClick={(e) => disconnect()}
            style={{ cursor: "pointer" }}
          >
            <p>Connected as: {walletAddress}</p>
          </div>
          <TemplateForm onCreate={onCreate} templateId={undefined} />
          <h2 className="text-2xl">Templates</h2>
          <div className="flex justify-between">
            <button
              onClick={previousPage}
              className="border border-indigo-500 bg-indigo-500 text-white rounded-md p-1 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline mb-2"
            >
              Previous Page
            </button>
            <p>{currentPage}</p>
            <button
              onClick={nextPage}
              disabled={templates?.length !== LIMIT}
              className={
                templates?.length !== LIMIT
                  ? "border border-gray-300 bg-gray-300 text-white rounded-md p-1 transition duration-500 ease select-none focus:outline-none focus:shadow-outline mb-2 cursor-not-allowed"
                  : "border border-indigo-500 bg-indigo-500 text-white rounded-md p-1 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline mb-2"
              }
            >
              Next Page
            </button>
          </div>
          <div>
            {templates?.map((tuple) => {
              const id = tuple[0];
              const template = tuple[1];
              return (
                <TemplateListItem
                  key={id}
                  template={template}
                  id={id}
                  canDelete={
                    walletAddress === template.creator ||
                    walletAddress === config?.admin_address
                  }
                  deleteTemplate={deleteTemplate}
                />
              );
            })}
          </div>
        </div>
      </div>
    </WalletLoader>
  );
};

// export TIERLIST_CODE_ID=$(junod tx wasm store "cw_tierlist.wasm" --from "$WALLET_NAME" $TXFLAG --output json | jq -r '.logs[0].events[-1].attributes[0].value')
// export TIERLIST_INIT='{"admin_address": "'"$MULTISIG_ADDRESS"'"}'
// junod tx wasm instantiate $TIERLIST_CODE_ID "$TIERLIST_INIT" --from "$WALLET_NAME" --label "cw-tierlist" $TXFLAG --admin "$MULTISIG_ADDRESS"
// export TIERLIST_ADDRESS=$(junod q wasm list-contract-by-code $TIERLIST_CODE_ID --node $RPC --output json | jq -r '.contracts[-1]')

export default Home;
