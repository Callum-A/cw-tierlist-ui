import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import WalletLoader from 'components/WalletLoader';
import { useSigningClient } from 'contexts/cosmwasm';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIERLIST_ADDRESS || '';

const Tierlist = () => {
    const router = useRouter();
    const [tierlist, setTierlist] = useState<any>({
        template_id: -1,
        items_to_tiers: []
    });
    const [selectedItem, setSelectedItem] = useState('');
    const [tier, setTier] = useState('');
    const [template, setTemplate] = useState<any>({ title: '', items: [] });
    const { walletAddress, signingClient } = useSigningClient();
    const { templateId } = router.query;
    const casted = Number.parseInt(templateId as string);
    useEffect(() => {
        const main = async () => {
            const tierlistResponse = await signingClient?.queryContractSmart(
                CONTRACT_ADDRESS,
                {
                    tierlist_from_template: {
                        id: casted
                    }
                }
            );
            const templateResponse = await signingClient?.queryContractSmart(
                CONTRACT_ADDRESS,
                { template: { id: casted } }
            );
            const userTierlistResponse =
                await signingClient?.queryContractSmart(CONTRACT_ADDRESS, {
                    tierlist: { address: walletAddress || '', id: casted }
                });
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
                newItemsToTiers.push([
                    item[0],
                    tier === 'Unassigned' ? '' : tier
                ]);
            } else {
                newItemsToTiers.push(item);
            }
        });
        const newTierlist = {
            template_id: tierlist.template_id,
            items_to_tiers: newItemsToTiers
        };
        setTierlist(newTierlist);
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
                    <h1 className="text-2xl">{template?.title}</h1>
                    <h2>Assign Item</h2>
                    <form onSubmit={addToTier}>
                        <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                        >
                            <option value="" disabled selected>
                                Select an Item
                            </option>
                            {tierlist?.items_to_tiers.map((item: any) => {
                                console.log(item);
                                return (
                                    <option
                                        key={item[0].name}
                                        value={item[0].name}
                                    >
                                        {item[0].name}
                                    </option>
                                );
                            })}
                        </select>
                        <input
                            type="text"
                            list="existingOptions"
                            value={tier}
                            onChange={(e) => setTier(e.target.value)}
                        />
                        <datalist id="existingOptions">
                            <option key="" value="Unassigned">
                                Unassigned
                            </option>
                            {tierlist?.items_to_tiers.map((item: any) => {
                                if (item[1] === '') return <></>;
                                return (
                                    <option key={item[0].name} value={item[1]}>
                                        {item[1]}
                                    </option>
                                );
                            })}
                        </datalist>
                        <button>Add To Tier</button>
                    </form>
                    <div>
                        <h2>Current Tierlist</h2>
                        {Object.keys(tierlistMap).map((tier: string) => {
                            const assignedItems = tierlistMap[tier];
                            return (
                                <div key={tier}>
                                    <h3>{tier === '' ? 'Unassigned' : tier}</h3>
                                    <ul>
                                        {assignedItems.map((item: any) => (
                                            <li key={item.name}>{item.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </WalletLoader>
    );
};

export default Tierlist;
