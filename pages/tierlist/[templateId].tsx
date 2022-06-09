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
            const userTierlistResponse =
                await signingClient?.queryContractSmart(CONTRACT_ADDRESS, {
                    tierlist: { address: walletAddress || '', id: casted }
                });
            console.log({ tierlistResponse, userTierlistResponse });
            if (!userTierlistResponse.tierlist) {
                // User has not saved this before
                setTierlist(tierlistResponse.tierlist);
            } else {
                // User has saved before
                setTierlist(userTierlistResponse.tierlist);
            }
        };
        main();
    }, [casted, signingClient, walletAddress]);

    if (isNaN(casted)) {
        return <div>Error</div>;
    }

    return (
        <WalletLoader>
            <p>123</p>
        </WalletLoader>
    );
};

export default Tierlist;
