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

function SimpleCounterExample() {
  // Define Wallet Config
  const walletConfig = {
    network: PushUI.CONSTANTS.PUSH_NETWORK.TESTNET,
  };

  // Define Simple Counter ABI, taking minimal ABI for the demo
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
      name: 'reset',
      outputs: [],
      stateMutability: 'nonpayable',
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
  ];

  // Contract address for the Simple Counter
  const CONTRACT_ADDRESS = '0x959ED7f6943bdd56B3a359BAE0115fef4aa07e17';

  function Component() {
    const { connectionStatus } = usePushWalletContext();
    const { pushChainClient } = usePushChainClient();

    // State to store counter values
    const [countPC, setCountPC] = useState(-1);
    const [isLoadingIncrement, setIsLoadingIncrement] = useState(false);
    const [isLoadingReset, setIsLoadingReset] = useState(false);
    const [txHash, setTxHash] = useState('');

    // Function to encode increment transaction data
    const getIncrementTxData = () => {
      return PushChain.utils.helpers.encodeTxData({
        abi: UCABI,
        functionName: 'increment',
      });
    };

    // Function to encode reset transaction data
    const getResetTxData = () => {
      return PushChain.utils.helpers.encodeTxData({
        abi: UCABI,
        functionName: 'reset',
      });
    };

    // Function to fetch counter values
    const fetchCounters = async () => {
      if (!pushChainClient) return;

      try {
        const provider = new ethers.JsonRpcProvider(
          'https://evm.rpc-testnet-donut-node1.push.org/'
        );
        const contract = new ethers.Contract(CONTRACT_ADDRESS, UCABI, provider);

        const pcCount = await contract.countPC();
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
          setIsLoadingIncrement(true);
          const data = getIncrementTxData();

          const tx = await pushChainClient.universal.sendTransaction({
            to: CONTRACT_ADDRESS,
            value: BigInt(0),
            data: data,
          });

          setTxHash(tx.hash);
          await tx.wait();

          await fetchCounters();
          setIsLoadingIncrement(false);
        } catch (err) {
          console.error('Transaction error:', err);
          setIsLoadingIncrement(false);
        }
      }
    };

    // Handle transaction to reset counter
    const handleResetTransaction = async () => {
      if (pushChainClient) {
        try {
          setIsLoadingReset(true);
          const data = getResetTxData();

          const tx = await pushChainClient.universal.sendTransaction({
            to: CONTRACT_ADDRESS,
            value: BigInt(0),
            data: data,
          });

          setTxHash(tx.hash);
          await tx.wait();

          await fetchCounters();
          setIsLoadingReset(false);
        } catch (err) {
          console.error('Reset transaction error:', err);
          setIsLoadingReset(false);
        }
      }
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <h2>Simple Counter Example</h2>

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
          <h3>PC Counter: {countPC == -1 ? '...' : countPC}</h3>
        </div>

        {connectionStatus === PushUI.CONSTANTS.CONNECTION.STATUS.CONNECTED && (
          <div className='counter-container' style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button
                className='increment-button'
                onClick={handleSendTransaction}
                disabled={isLoadingIncrement}
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
                {isLoadingIncrement ? 'Processing...' : 'Increment Counter'}
              </button>

              <button
                className='reset-button'
                onClick={handleResetTransaction}
                disabled={isLoadingReset}
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
                {isLoadingReset ? 'Processing...' : 'Reset Counter'}
              </button>
            </div>

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

export default SimpleCounterExample;