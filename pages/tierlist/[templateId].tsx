import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import Link from "next/link";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIERLIST_ADDRESS || "";

const Tierlist = () => {
  const router = useRouter();
  const [tierlist, setTierlist] = useState<any>({
    template_id: -1,
    items_to_tiers: [],
  });
  const [selectedItem, setSelectedItem] = useState("");
  const [tier, setTier] = useState("");
  const [template, setTemplate] = useState<any>({ title: "", items: [] });
  const { walletAddress, signingClient, disconnect } = useSigningClient();
  const { templateId } = router.query;
  const casted = Number.parseInt(templateId as string);

  useEffect(() => {
    const main = async () => {
      const tierlistResponse = await signingClient?.queryContractSmart(
        CONTRACT_ADDRESS,
        {
          tierlist_from_template: {
            id: casted,
          },
        }
      );
      const templateResponse = await signingClient?.queryContractSmart(
        CONTRACT_ADDRESS,
        { template: { id: casted } }
      );
      const userTierlistResponse = await signingClient?.queryContractSmart(
        CONTRACT_ADDRESS,
        {
          tierlist: { address: walletAddress || "", id: casted },
        }
      );
      console.log({ tierlistResponse, userTierlistResponse });
      if (!userTierlistResponse?.tierlist) {
        // User has not saved this before
        setTierlist(tierlistResponse?.tierlist);
      } else {
        // User has saved before
        setTierlist(userTierlistResponse?.tierlist);
      }
      setTemplate(templateResponse?.template);
    };
    main();
  }, [casted, signingClient, walletAddress]);

  const addToTier = (e: React.FormEvent) => {
    e.preventDefault();
    const newItemsToTiers: any[] = [];
    tierlist.items_to_tiers.forEach((item: any) => {
      if (item[0].name === selectedItem) {
        newItemsToTiers.push([item[0], tier === "Unassigned" ? "" : tier]);
      } else {
        newItemsToTiers.push(item);
      }
    });
    const newTierlist = {
      template_id: tierlist.template_id,
      items_to_tiers: newItemsToTiers,
    };
    setTierlist(newTierlist);
    setSelectedItem("");
    setTier("");
  };

  const saveTierlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(tierlist);
    try {
      const msg = { save_tierlist: { tierlist } };
      await signingClient?.execute(
        walletAddress,
        CONTRACT_ADDRESS,
        msg,
        "auto"
      );
    } catch (err) {
      console.error(err);
    }
  };

  const tierlistMap: any = {};
  tierlist?.items_to_tiers.forEach((item: any) => {
    const t = item[1];
    const i = item[0];
    if (!tierlistMap[t]) {
      tierlistMap[t] = [];
    }
    tierlistMap[t].push(i);
  });
  console.log(tierlistMap);

  if (isNaN(casted)) {
    return <div>Error</div>;
  }

  return (
    <WalletLoader>
      <div className="w-full flex justify-center">
        <div className="w-1/2">
          <h1 className="text-3xl">{template?.title}</h1>

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
          <h2 className="text-2xl pb-2">Assign Item</h2>
          <form onSubmit={addToTier}>
            <div className="pb-2">
              <label>
                <p>Item</p>
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  <option value="" disabled selected>
                    Select an Item
                  </option>
                  {tierlist?.items_to_tiers.map((item: any) => {
                    console.log(item);
                    return (
                      <option key={item[0].name} value={item[0].name}>
                        {item[0].name}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>
            <div className="pb-2">
              <label>
                <p>Tier</p>
                <input
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  type="text"
                  list="existingOptions"
                  placeholder="Type or select an existing tier e.g. S"
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                />
              </label>
            </div>
            <datalist id="existingOptions">
              <option key="" value="Unassigned">
                Unassigned
              </option>
              {Object.keys(tierlistMap).map((tier: string) => (
                <option key={tier}>{tier}</option>
              ))}
            </datalist>
            <button className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline mb-2">
              Add To Tier
            </button>
          </form>
          <div className="mb-2">
            <h2 className="text-2xl pb-2">Current Tierlist</h2>
            {Object.keys(tierlistMap).map((tier: string) => {
              const assignedItems = tierlistMap[tier];
              return (
                <div key={tier} className="border-4 p-2 my-2">
                  <h3 className="text-xl pb-2">
                    {tier === "" ? "Unassigned" : tier}
                  </h3>
                  <ul>
                    {assignedItems.map((item: any) => (
                      <li key={item.name}>{item.name}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <button
            onClick={saveTierlist}
            className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline mb-2"
          >
            Save Tierlist
          </button>
        </div>
      </div>
    </WalletLoader>
  );
};

export default Tierlist;
