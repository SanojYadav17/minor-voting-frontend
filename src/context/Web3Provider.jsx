import { useEffect, useState } from "react"; 
import { Web3Context } from "./Web3Context"; 
import { getWeb3State } from "../utils/getWeb3State"; 
import { handleAccountChange } from "../utils/handleAccountChange"; 
import { handleChainChange } from "../utils/handleChainChange";
import { VotingStatusProvider } from "./VotingStatusContext"; 

const Web3Provider = ({ children }) => {
  // Set initial state for web3 with null values for contract instance, selected account, and chain ID
  const [web3State, setWeb3State] = useState({
    contractInstance: null,
    selectedAccount: null,
    chainId: null,
    networkName: null,
    signer: null,
    provider: null
  });

  const [isLoading, setIsLoading] = useState(false);

  // Function to handle wallet connection and retrieve web3 state
  const handleWallet = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const { contractInstance, selectedAccount, chainId, networkName, signer, provider } = await getWeb3State();

      // Update the web3State with the fetched data
      setWeb3State({ contractInstance, selectedAccount, chainId, networkName, signer, provider });
      
      // Persist selectedAccount to localStorage
      localStorage.setItem('selectedAccount', selectedAccount);
    } catch (error) {
      console.log(error); 
      alert(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle wallet disconnection
  const disconnectWallet = () => {
    setWeb3State(prevState => ({
      ...prevState,
      selectedAccount: null,
      chainId: null,
      networkName: null,
      signer: null,
      provider: null
    }));
    localStorage.removeItem('selectedAccount'); // Clear from localStorage
  };

  // useEffect to add event listeners for account and chain (network) changes in MetaMask
  useEffect(() => {
    const initWeb3State = async () => {
      const storedAccount = localStorage.getItem('selectedAccount');
      if (storedAccount && window.ethereum) {
        try {
          // Reconnect wallet automatically if account was stored
          const { contractInstance, selectedAccount, chainId, networkName, signer, provider } = await getWeb3State();
          setWeb3State({ contractInstance, selectedAccount, chainId, networkName, signer, provider });
        } catch (error) {
          console.log("Failed to reconnect wallet:", error);
          // If reconnection fails, just set the stored account
          setWeb3State(prevState => ({
            ...prevState,
            selectedAccount: storedAccount
          }));
        }
      }
    };

    initWeb3State();

    // Check if MetaMask (window.ethereum) is available
    if (window.ethereum) {
      // Listen for changes in the accounts and chains, and handle them accordingly
      window.ethereum.on('accountsChanged', () => handleAccountChange(setWeb3State));
      window.ethereum.on('chainChanged', () => handleChainChange(setWeb3State));

      // Cleanup: Remove the listeners when the component unmounts
      return () => {
        window.ethereum.removeListener('accountsChanged', () => handleAccountChange(setWeb3State));
        window.ethereum.removeListener('chainChanged', () => handleChainChange(setWeb3State));
      };
    } else {
      console.warn('MetaMask is not installed. Please install MetaMask extension to use this DApp.');
    }
  }, []); // Empty dependency array ensures this runs once on component mount

  return (
    <>
      {/* Wrap children components with the Web3Context provider to pass web3State & handleWallet globally */}
      <Web3Context.Provider value={{ web3State, handleWallet, disconnectWallet, isLoading }}>
        <VotingStatusProvider>
          {children}
        </VotingStatusProvider>
      </Web3Context.Provider>
    </>
  );
};

export default Web3Provider;
