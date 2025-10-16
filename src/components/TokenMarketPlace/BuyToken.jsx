import { useRef, useState } from "react";
import { ethers } from "ethers"; // Use ethers for handling Ethereum transactions
import toast from "react-hot-toast";

const BuyToken = ({ contractInstance }) => {
  const buyTokenAmountRef = useRef();
  const [isProcessing, setIsProcessing] = useState(false);

  const buyToken = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      
      // User enters TOKEN amount
      const tokenAmount = buyTokenAmountRef.current.value;

      // Input validation
      if (isNaN(tokenAmount) || parseFloat(tokenAmount) <= 0) {
        toast.error("Please enter a valid token amount.");
        setIsProcessing(false);
        return;
      }

      // Convert token amount to Wei (smallest unit - 18 decimals)
      const tokenAmountWei = ethers.parseUnits(tokenAmount, 18);
      
      console.log("Buying", tokenAmount, "tokens");
      console.log("Token Amount in Wei:", tokenAmountWei.toString());

      // Ensure the contract instance has a signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = contractInstance.connect(signer);

      // Get token price from contract (price per token in Wei)
      const tokenPriceWei = await contractWithSigner.tokenPrice();
      console.log("Token Price (Wei):", tokenPriceWei.toString());
      console.log("Token Price (ETH):", ethers.formatEther(tokenPriceWei), "ETH per token");
      
      // Calculate total cost using contract's formula
      // Contract: priceToPay = (_amountOfToken * tokenPrice) / 1 ether
      const totalCostWei = (tokenAmountWei * tokenPriceWei) / BigInt(10 ** 18);
      console.log("Total Cost (Wei):", totalCostWei.toString());
      console.log("Total Cost (ETH):", ethers.formatEther(totalCostWei), "ETH");

      // Check if user has enough ETH
      const userBalance = await provider.getBalance(await signer.getAddress());
      console.log("User ETH Balance:", ethers.formatEther(userBalance), "ETH");
      
      if (userBalance < totalCostWei) {
        toast.error("Insufficient ETH balance!");
        setIsProcessing(false);
        return;
      }

      // Prepare transaction - send token amount in Wei
      const tx = await contractWithSigner.buyCkToken(tokenAmountWei, {
        value: totalCostWei,
        gasLimit: 500000,
      });
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      console.log("Transaction Receipt:", receipt);

      // Show success toast
      toast.success((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px', animation: 'bounce 0.6s ease-in-out' }}>💰</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Tokens Bought!</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{tokenAmount} CK tokens</div>
          </div>
        </div>
      ), {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
        },
      });
      
      // Clear input
      buyTokenAmountRef.current.value = "";
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      console.error("Transaction Error:", error);
      
      // Compact error toasts
      const msg = (error && (error.reason || error.message)) || 'Failed';
      
      if (msg.toLowerCase().includes("insufficient funds") || msg.toLowerCase().includes("insufficient eth")) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>💸</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Insufficient ETH</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Not enough balance</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(245, 87, 108, 0.35)',
          },
        });
      } else if (msg.toLowerCase().includes("marketplace") || msg.toLowerCase().includes("not enough tokens")) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Low Supply</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Contact admin</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(250, 112, 154, 0.35)',
          },
        });
      } else if (msg.toLowerCase().includes("user rejected") || error.code === "ACTION_REJECTED") {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⛔</span>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Cancelled</span>
          </div>
        ), {
          duration: 2000,
          style: {
            background: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
            color: '#fff',
            borderRadius: '50px',
            padding: '12px 20px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
          },
        });
      } else {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>❌</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Purchase Failed</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Try again</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(245, 87, 108, 0.35)',
          },
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl rounded-xl p-6 hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300">
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      <form onSubmit={buyToken}>
        <div className="mb-4">
          <label htmlFor="buyTokenAmount" className="block text-sm font-bold text-white mb-2">
            Amount to Buy (Tokens):
          </label>
          <input
            type="number"
            id="buyTokenAmount"
            ref={buyTokenAmountRef}
            step="0.000001"
            min="0"
            placeholder="Enter number of tokens (e.g., 10)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-gray-900 font-bold"
          />
          <p className="text-xs text-gray-100 mt-1 font-bold">
            💡 Price: 0.001 ETH per token
          </p>
          <p className="text-xs text-yellow-200 mt-1 font-bold">
            Example: 10 tokens = 0.01 ETH
          </p>
        </div>
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-bold transition-all shadow-lg ${
            isProcessing 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-white text-purple-600 hover:bg-gray-100 transform hover:scale-105'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Buy Tokens'}
        </button>
      </form>
    </div>
  );
};

export default BuyToken;
