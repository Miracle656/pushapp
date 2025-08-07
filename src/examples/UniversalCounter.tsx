import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  PushUniversalWalletProvider,
  PushUniversalAccountButton,
  usePushWalletContext,
  usePushChainClient,
  PushUI,
} from '@pushchain/ui-kit';
import { PushChain } from '@pushchain/core';

function UniversalCounterExample() {
  // Define Wallet Config
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  };

  // Define Universal Counter ABI, taking minimal ABI for the demo
  const UCABI = [
    {
      inputs: [],
      name: 'increment',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'countEth',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'countPC',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'countSol',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  // Contract address for the Universal Counter
  const CONTRACT_ADDRESS = '0x5A59a5Ac94d5190553821307F98e4673BF3c4a1D';

  function Component() {
    const { connectionStatus } = usePushWalletContext();
    const { pushChainClient } = usePushChainClient();

    // State to store counter values
    const [countEth, setCountEth] = useState(-1);
    const [countSol, setCountSol] = useState(-1);
    const [countPC, setCountPC] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [txHash, setTxHash] = useState('');

    // Function to encode transaction data
    const getTxData = () => {
      return PushChain.utils.helpers.encodeTxData({
        abi: UCABI,
        functionName: 'increment',
      });
    };

    // Function to fetch counter values
    const fetchCounters = async () => {
      if (!pushChainClient) return;

      try {
        // Create a contract instance for read operations
        const provider = new ethers.JsonRpcProvider(
          'https://evm.rpc-testnet-donut-node1.push.org/'
        );
        const contract = new ethers.Contract(CONTRACT_ADDRESS, UCABI, provider);

        // Fetch counter values
        const ethCount = await contract.countEth();
        const solCount = await contract.countSol();
        const pcCount = await contract.countPC();

        // Update state
        setCountEth(Number(ethCount));
        setCountSol(Number(solCount));
        setCountPC(Number(pcCount));
      } catch (err) {
        console.error('Error fetching counter values:', err);
      }
    };

    // Fetch counter values on component mount and when connection status changes
    useEffect(() => {
      if (connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED) {
        fetchCounters();
      }
    }, [connectionStatus, pushChainClient]);

    // Handle transaction to increment counter
    const handleSendTransaction = async () => {
      if (pushChainClient) {
        try {
          setIsLoading(true);
          const data = getTxData();

          const tx = await pushChainClient.universal.sendTransaction({
            to: CONTRACT_ADDRESS,
            value: BigInt(0),
            data: data,
          });

          setTxHash(tx.hash);

          // Wait for transaction to be mined
          await tx.wait();

          // Refresh counter values
          await fetchCounters();
          setIsLoading(false);
        } catch (err) {
          console.error('Transaction error:', err);
          setIsLoading(false);
        }
      }
    };

    // Function to determine which chain is winning
    const getWinningChain = () => {
      if (countEth === -1 || countSol === -1 || countPC === -1) return null;

      if (countEth > countSol && countEth > countPC) {
        return `Ethereum is winning with ${countEth} counts`;
      } else if (countSol > countEth && countSol > countPC) {
        return `Solana is winning with ${countSol} counts`;
      } else if (countPC > countEth && countPC > countSol) {
        return `Push Chain is winning with ${countPC} counts`;
      } else {
        // Handle ties
        if (countEth === countSol && countEth === countPC && countEth > 0) {
          return `It's a three-way tie with ${countEth} counts each`;
        } else if (countEth === countSol && countEth > countPC) {
          return `Ethereum and Solana are tied with ${countEth} counts each`;
        } else if (countEth === countPC && countEth > countSol) {
          return `Ethereum and Push Chain are tied with ${countEth} counts each`;
        } else if (countSol === countPC && countSol > countEth) {
          return `Solana and Push Chain are tied with ${countSol} counts each`;
        } else {
          return null; // No winner yet or all zeros
        }
      }
    };

    const winningMessage = getWinningChain();

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <h2>Universal Counter Example</h2>

        <PushUniversalAccountButton />

        {connectionStatus !== PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED && (
          <p>Please connect your wallet to interact with the counter.</p>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            flexWrap: 'nowrap',
          }}
        >
          <h3>
            Total Universal Count:{' '}
            {countEth == -1 ? '...' : countEth + countSol + countPC}
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '12px',
              width: '100%',
            }}
          >
            <div className='counter-box'>
              <h3>ETH Counter: {countEth == -1 ? '...' : countEth}</h3>
            </div>

            <div className='counter-box'>
              <h3>Sol Counter: {countSol == -1 ? '...' : countSol}</h3>
            </div>

            <div className='counter-box'>
              <h3>PC Counter: {countPC == -1 ? '...' : countPC}</h3>
            </div>
          </div>
        </div>

        {connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED && (
          <div className='counter-container' style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button
                className='increment-button'
                onClick={handleSendTransaction}
                disabled={isLoading}
                style={{
                  backgroundColor: '#d946ef',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? 'Processing...' : 'Increment Counter'}
              </button>

              <button
                className='refresh-button'
                onClick={fetchCounters}
                style={{
                  backgroundColor: '#d946ef',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Refresh Counter Values
              </button>
            </div>

            {winningMessage && (
              <div style={{ margin: '10px 0', fontWeight: 'bold', color: '#d946ef' }}>
                {winningMessage}
              </div>
            )}

            {txHash && pushChainClient && (
              <div className='transaction-info' style={{ textAlign: 'center' }}>
                <p>
                  Transaction Hash:{' '}
                  <a
                    href={pushChainClient.explorer.getTransactionUrl(txHash)}
                    target='_blank'
                    style={{ color: '#d946ef', textDecoration: 'underline' }}
                  >
                    {txHash}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <PushUniversalWalletProvider config={walletConfig}>
      <Component />
    </PushUniversalWalletProvider>
  );
}

export default UniversalCounterExample;