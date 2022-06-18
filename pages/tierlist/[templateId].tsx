import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import WalletLoader from "components/WalletLoader";
import { useSigningClient } from "contexts/cosmwasm";
import Link from "next/link";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIERLIST_ADDRESS || "";

const Tierlist = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [tierlist, setTierlist] = useState<any>({
    template_id: -1,
    items_to_tiers: [],
  });
  const [selectedItem, setSelectedItem] = useState("");
  const [tier, setTier] = useState("");
  const [template, setTemplate] = useState<any>({ title: "", items: [] });
  const { walletAddress, signingClient, disconnect } = useSigningClient();
  const { templateId, address } = router.query;
  const addressToUse = !address ? walletAddress : (address as string);
  const canEdit = addressToUse === walletAddress;
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
          tierlist: { address: addressToUse || "", id: casted },
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
  }, [casted, signingClient, addressToUse]);

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
    try {
      const msg = { save_tierlist: { tierlist } };
      await signingClient?.execute(
        walletAddress,
        CONTRACT_ADDRESS,
        msg,
        "auto"
      );
      setMessage("Saved tierlist successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const promoteTier = (e: React.MouseEvent, tier: string) => {
    const currentTierOrder: string[] = [];
    tierlist.items_to_tiers.forEach((i: any) => {
      const tier: string = i[1];
      if (currentTierOrder.indexOf(tier) === -1) {
        currentTierOrder.push(tier);
      }
    });
    const tierToPromoteCurrentIndex = currentTierOrder.indexOf(tier);
    const tierToPromoteDesiredIndex =
      tierToPromoteCurrentIndex === 0 ? 0 : tierToPromoteCurrentIndex - 1;

    const tmp = currentTierOrder[tierToPromoteDesiredIndex];
    currentTierOrder[tierToPromoteDesiredIndex] =
      currentTierOrder[tierToPromoteCurrentIndex];
    currentTierOrder[tierToPromoteCurrentIndex] = tmp;

    const newItemsToTiers: any[] = [];
    currentTierOrder.forEach((tier) => {
      tierlist.items_to_tiers.forEach((i: any) => {
        const itemTier: string = i[1];
        if (tier === itemTier) {
          newItemsToTiers.push(i);
        }
      });
    });

    setTierlist({
      template_id: tierlist.template_id,
      items_to_tiers: newItemsToTiers,
    });
  };

  const demoteTier = (e: React.MouseEvent, tier: string) => {
    const currentTierOrder: string[] = [];
    tierlist.items_to_tiers.forEach((i: any) => {
      const tier: string = i[1];
      if (currentTierOrder.indexOf(tier) === -1) {
        currentTierOrder.push(tier);
      }
    });
    const tierToPromoteCurrentIndex = currentTierOrder.indexOf(tier);
    const tierToPromoteDesiredIndex =
      tierToPromoteCurrentIndex === currentTierOrder.length - 1
        ? currentTierOrder.length - 1
        : tierToPromoteCurrentIndex + 1;

    const tmp = currentTierOrder[tierToPromoteDesiredIndex];
    currentTierOrder[tierToPromoteDesiredIndex] =
      currentTierOrder[tierToPromoteCurrentIndex];
    currentTierOrder[tierToPromoteCurrentIndex] = tmp;

    const newItemsToTiers: any[] = [];
    currentTierOrder.forEach((tier) => {
      tierlist.items_to_tiers.forEach((i: any) => {
        const itemTier: string = i[1];
        if (tier === itemTier) {
          newItemsToTiers.push(i);
        }
      });
    });

    setTierlist({
      template_id: tierlist.template_id,
      items_to_tiers: newItemsToTiers,
    });
  };

  const shareTierlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const url =
      window.origin + router.asPath.split("?")[0] + "?address=" + addressToUse;
    navigator.clipboard.writeText(url);
    setMessage("Share link copied to clipboard!");
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

  if (isNaN(casted)) {
    return <div>Error</div>;
  }

  return (
    <WalletLoader>
      {message && (
        <div className="w-full flex justify-center border-4 p-2 text-xl">
          {message}
        </div>
      )}
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
          {canEdit && (
            <div>
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
            </div>
          )}
          <div className="mb-2">
            <h2 className="text-2xl pb-2">
              {canEdit ? "Current Tierlist" : `${addressToUse}'s Tierlist`}
            </h2>
            {Object.keys(tierlistMap).map((tier: string) => {
              const assignedItems = tierlistMap[tier];
              return (
                <div key={tier} className="border-4 p-2 my-2">
                  <h3 className="text-xl">
                    {tier === "" ? "Unassigned" : tier}
                  </h3>
                  <div className="flex pb-2">
                    <small
                      className="mr-2 hover:underline"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => promoteTier(e, tier)}
                    >
                      Promote Tier
                    </small>
                    <small
                      className="hover:underline"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => demoteTier(e, tier)}
                    >
                      Demote Tier
                    </small>
                  </div>
                  <ul>
                    {assignedItems.map((item: any) => (
                      <li key={item.name}>{item.name}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          {canEdit && (
            <div className="flex">
              <button
                onClick={saveTierlist}
                className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline mb-2 mr-2"
              >
                Save Tierlist
              </button>
              <button
                onClick={shareTierlist}
                className="border border-indigo-500 bg-indigo-500 text-white rounded-md px-4 py-2 transition duration-500 ease select-none hover:bg-indigo-600 focus:outline-none focus:shadow-outline mb-2"
              >
                Share Tierlist
              </button>
            </div>
          )}
        </div>
      </div>
    </WalletLoader>
  );
};

export default Tierlist;
