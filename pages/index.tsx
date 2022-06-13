import type { NextPage } from 'next';
import Link from 'next/link';
import WalletLoader from 'components/WalletLoader';
import { useSigningClient } from 'contexts/cosmwasm';
import { useEffect, useState } from 'react';
import TemplateForm from 'components/TemplateForm';
import TemplateListItem from 'components/TemplateListItem';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIERLIST_ADDRESS || '';

const Home: NextPage = () => {
    const { signingClient } = useSigningClient();
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

    return (
        <WalletLoader>
            <div className="w-full flex justify-center">
                <div className="w-1/2">
                    <h1 className="text-3xl">Cosmwasm Tierlist</h1>
                    <TemplateForm />
                    <div>
                        {templates?.map((tuple) => {
                            const id = tuple[0];
                            const template = tuple[1];
                            return (
                                <TemplateListItem
                                    key={id}
                                    template={template}
                                    id={id}
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
