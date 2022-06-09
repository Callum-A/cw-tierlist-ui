import type { NextPage } from 'next';
import Link from 'next/link';
import WalletLoader from 'components/WalletLoader';
import { useSigningClient } from 'contexts/cosmwasm';
import { useEffect, useState } from 'react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIERLIST_ADDRESS || '';

const Home: NextPage = () => {
    const { walletAddress, signingClient } = useSigningClient();
    const [title, setTitle] = useState('');
    const [items, setItems] = useState<string[]>([]);
    const [templates, setTemplates] = useState<[number, any][]>();
    useEffect(() => {
        const main = async () => {
            const templates: [number, any][] =
                await signingClient?.queryContractSmart(CONTRACT_ADDRESS, {
                    templates: { start_after: null, limit: null }
                });
            console.log(templates);
            setTemplates(templates);
        };
        main();
    }, [signingClient]);

    const onSubmit = async () => {
        console.log(title, items);
        if (!signingClient || walletAddress === '') {
            return;
        }

        const tierlistItems: any[] = [];
        items.forEach((item) => {
            tierlistItems.push({ name: item, image_url: null });
        });

        try {
            await signingClient.execute(
                walletAddress,
                CONTRACT_ADDRESS,
                {
                    create_template: {
                        title,
                        items: tierlistItems
                    }
                },
                'auto'
            );
            setTitle('');
            setItems([]);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <WalletLoader>
            <h1>Hello World!</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
            >
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tierlist title"
                />
                <input
                    type="text"
                    value={items.join(',')}
                    onChange={(e) => {
                        setItems(e.target.value.split(','));
                    }}
                    placeholder="Tierlist items"
                />
                <button type="submit">Submit</button>
            </form>
            <div>
                {templates?.map((tuple) => {
                    const id = tuple[0];
                    const template = tuple[1];
                    const itemNames: string[] = [];
                    template.items.forEach((item: any) => {
                        itemNames.push(item.name);
                    });
                    return (
                        <div key={id}>
                            <h2>{template.title}</h2>
                            <p>Items: {itemNames.join(', ')}</p>
                        </div>
                    );
                })}
            </div>
        </WalletLoader>
    );
};

// export TIERLIST_CODE_ID=$(junod tx wasm store "cw_tierlist.wasm" --from "$WALLET_NAME" $TXFLAG --output json | jq -r '.logs[0].events[-1].attributes[0].value')
// export TIERLIST_INIT='{"admin_address": "'"$MULTISIG_ADDRESS"'"}'
// junod tx wasm instantiate $TIERLIST_CODE_ID "$TIERLIST_INIT" --from "$WALLET_NAME" --label "cw-tierlist" $TXFLAG --admin "$MULTISIG_ADDRESS"
// export TIERLIST_ADDRESS=$(junod q wasm list-contract-by-code $TIERLIST_CODE_ID --node $RPC --output json | jq -r '.contracts[-1]')

export default Home;
