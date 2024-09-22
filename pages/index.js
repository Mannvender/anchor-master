import React, { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  WalletModalProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import "./styles.css"; // Import the CSS file for styling

const network = WalletAdapterNetwork.Mainnet;
const connection = new Connection(network);

const App = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <TransferComponent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const TransferComponent = () => {
  const { connected, wallet } = useWallet();
  const [amount, setAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  const handleTransfer = async () => {
    if (wallet && connected) {
      try {
        const recipient = new PublicKey(
          "3MeMEe7UEYYSXcdGuWcjZx9Q35E9VJ6h16WWSVX6Sovf"
        );
        const transferAmount = parseFloat(amount);

        if (isNaN(transferAmount) || transferAmount <= 0) {
          alert("Please enter a valid amount.");
          return;
        }

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: recipient,
            lamports: transferAmount * 1e9, // Convert SOL to lamports (1 SOL = 1e9 lamports)
          })
        );

        const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, "processed");
        setTransactionStatus("Transfer successful! Signature: " + signature);
      } catch (error) {
        console.error(error);
        setTransactionStatus("Transfer failed. Please try again.");
      }
    }
  };

  return (
    <div className="retro-container">
      <h1>Transfer SPL Tokens</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in SOL"
      />
      <button onClick={handleTransfer}>Transfer</button>
      {!connected && <button onClick={wallet.connect}>Connect Wallet</button>}
      {transactionStatus && <p>{transactionStatus}</p>}
    </div>
  );
};

export default App;
