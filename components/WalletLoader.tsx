import { ReactNode } from 'react';
import { useSigningClient } from 'contexts/cosmwasm';

function WalletLoader({
    children,
    loading = false
}: {
    children: ReactNode;
    loading?: boolean;
}) {
    const {
        walletAddress,
        loading: clientLoading,
        error,
        connectWallet
    } = useSigningClient();

    if (loading || clientLoading) {
        return <div className="flex justify-center">Loading...</div>;
    }

    if (walletAddress === '') {
        return (
            <div>
                <div>
                    <button className="border-4 p-2" onClick={connectWallet}>
                        <h3>Connect your wallet &rarr;</h3>
                        <p>
                            Get your Keplr wallet connected now and start using
                            it with CosmJS.
                        </p>
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return <code>{JSON.stringify(error)}</code>;
    }

    return <div>{children}</div>;
}

export default WalletLoader;
