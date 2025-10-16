import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const TokenPrice = ({ contractInstance }) => {
  const [tokenPrice, setTokenPrice] = useState(null); // Changed to null for loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        if (!contractInstance) {
          setTokenPrice(null);
          return;
        }

        const price = await contractInstance.tokenPrice();
        const priceEth = ethers.formatEther(price);
        setTokenPrice(priceEth);
        setLoading(false);
      } catch (error) {
        // Silently handle - just log
        console.log("Token price fetch pending...");
        setLoading(false);
      }
    };

    if (contractInstance) {
      // Initial delay to let other components load first
      const initialTimer = setTimeout(fetchTokenPrice, 3000);
      
      // Refresh every 60 seconds (reduce frequency)
      const interval = setInterval(fetchTokenPrice, 60000);
      
      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [contractInstance]);

  return (
    <div className="flex flex-col items-center justify-between bg-gray-700 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2 text-blue-400">Current Token Price:</h2>
      {/* {loading ? (
        <p className="text-lg text-white">Loading...</p>
      ) : (
      )} */}
      <p className="text-2xl font-bold text-white">
      {tokenPrice !== null ? `${tokenPrice} Eth` : "Loading..."}
        </p>
    </div>
  );
};

export default TokenPrice;
