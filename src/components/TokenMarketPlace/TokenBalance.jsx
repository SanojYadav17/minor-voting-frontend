import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useWeb3Context } from "../../context/useWeb3Context";

const TokenBalance = ({ erc20ContractInstance }) => {
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const [userTokenBalance, setUserTokenBalance] = useState(null);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        if (!selectedAccount || !erc20ContractInstance) {
          setUserTokenBalance(null);
          return;
        }
        
        const tokenBalanceWei = await erc20ContractInstance.balanceOf(selectedAccount);
        const tokenBalanceEth = ethers.formatEther(tokenBalanceWei);
        setUserTokenBalance(tokenBalanceEth);
      } catch (error) {
        // Silently handle - just log
        console.log("Token balance fetch pending...");
      }
    };

    if (erc20ContractInstance && selectedAccount) {
      // Initial delay to let other components load first
      const initialTimer = setTimeout(fetchTokenBalance, 2000);
      
      // Refresh every 60 seconds (reduce frequency)
      const interval = setInterval(fetchTokenBalance, 60000);
      
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [erc20ContractInstance, selectedAccount]);

  return (
    <div className="flex flex-col items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2 text-blue-400">Your Token Balance:</h2>
      <p className="text-2xl font-bold text-white">
      {userTokenBalance !== null ? `${userTokenBalance} CK Tokens` : "Loading..."}
      </p>
    </div>
  );
};

export default TokenBalance;
