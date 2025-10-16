import { useRef, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const SellToken = ({ contractInstance, erc20ContractInstance }) => {
  const sellTokenAmountRef = useRef();
  const approveTokenAmountRef = useRef();
  const [isSelling, setIsSelling] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const sellToken = async (e) => {
    e.preventDefault();
    try {
      setIsSelling(true);
      
      // User enters TOKEN amount, not ETH
      const tokenAmount = sellTokenAmountRef.current.value;
      
      // Convert to Wei (token amount × 10^18)
      const tokenAmountWei = ethers.parseEther(tokenAmount);

      // Ensure the contract instance has a signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = contractInstance.connect(signer);

      // Call the sellCkToken function with TOKEN amount
      const tx = await contractWithSigner.sellCkToken(tokenAmountWei);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      console.log("Transaction Receipt:", receipt);
      
      // Show success toast
      toast.success((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px', animation: 'bounce 0.6s ease-in-out' }}>💸</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Tokens Sold!</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{tokenAmount} CK tokens</div>
          </div>
        </div>
      ), {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 10px 40px rgba(240, 147, 251, 0.4)',
        },
      });
      
      // Clear input
      sellTokenAmountRef.current.value = "";
      setIsSelling(false);
    } catch (error) {
      setIsSelling(false);
      console.error("Selling Token Error:", error);
      
      // Compact error toasts
      const msg = (error && (error.reason || error.message)) || 'Failed';
      
      if (msg.toLowerCase().includes("insufficient token") || msg.toLowerCase().includes("balance")) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>💰</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Low Balance</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Not enough tokens</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(118, 75, 162, 0.35)',
          },
        });
      } else if (msg.toLowerCase().includes("marketplace") || msg.toLowerCase().includes("not enough eth")) {
        toast((t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Low ETH</div>
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
      } else if (msg.toLowerCase().includes("user rejected")) {
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
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Sale Failed</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>Try again</div>
            </div>
          </div>
        ), {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 30px rgba(118, 75, 162, 0.35)',
          },
        });
      }
    }
  };

  const approveToken = async (e) => {
    e.preventDefault();
    try {
      setIsApproving(true);
      
      // User enters TOKEN amount to approve
      const tokenAmount = approveTokenAmountRef.current.value;
      
      // Convert to Wei
      const tokenAmountWei = ethers.parseEther(tokenAmount);
      
      // Get Token Marketplace contract address from environment variables
      const tokenMarketplace = import.meta.env.VITE_TOKEN_MARKETPLACE_ADDRESS;
      
      if (!tokenMarketplace) {
        throw new Error("Token Marketplace address not found in environment variables");
      }
      
      console.log("Approve Token Amount:", tokenAmount, "tokens");
      console.log("Approve Token Amount in Wei:", tokenAmountWei.toString());

      // Ensure the erc20 contract instance has a signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const erc20ContractWithSigner = erc20ContractInstance.connect(signer);

      // Approve token transfer
      const tx = await erc20ContractWithSigner.approve(tokenMarketplace, tokenAmountWei);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      console.log("Approval Receipt:", receipt);
      
      // Show success toast
      toast.success((t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px', animation: 'bounce 0.6s ease-in-out' }}>✅</div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>Approved!</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Ready to sell</div>
          </div>
        </div>
      ), {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 10px 40px rgba(250, 112, 154, 0.4)',
        },
      });
      
      // Clear input
      approveTokenAmountRef.current.value = "";
      setIsApproving(false);
    } catch (error) {
      setIsApproving(false);
      console.error("Approving Token Error:", error);
      
      const msg = (error && (error.reason || error.message)) || 'Failed';
      
      if (msg.toLowerCase().includes("user rejected")) {
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
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Approval Failed</div>
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
    <div className="space-y-6">
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      <form onSubmit={sellToken} className="flex flex-col items-center space-y-4 bg-gray-700 p-4 rounded-lg shadow-md">
        <label className="text-xl font-bold mb-2 text-blue-400">Amount to Sell (Tokens):</label>
        <input
          type="number"
          step="0.000001"
          min="0"
          ref={sellTokenAmountRef}
          className="px-3 py-2 rounded-lg bg-gray-600 text-white w-full focus:outline-none focus:ring-2 focus:ring-red-400 font-bold"
          placeholder="Enter token amount (e.g., 100)"
          required
        />
        <div className="w-full text-center text-xs text-gray-300 font-bold">
          Price: 0.001 ETH per token
        </div>
        <button
          type="submit"
          disabled={isSelling}
          className={`px-6 py-2 w-full font-bold rounded-lg transition duration-300 shadow-lg ${
            isSelling 
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isSelling ? 'Processing...' : 'Sell Token'}
        </button>
      </form>

      <form onSubmit={approveToken} className="flex flex-col items-center space-y-4 bg-gray-700 p-4 rounded-lg shadow-md">
        <label className="text-xl font-bold mb-2 text-blue-400">Amount to Approve (Tokens):</label>
        <input
          type="number"
          step="0.000001"
          min="0"
          ref={approveTokenAmountRef}
          className="px-3 py-2 rounded-lg bg-gray-600 text-white w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
          placeholder="Enter token amount (e.g., 100)"
          required
        />
        <div className="w-full text-center text-xs text-gray-300 font-bold">
          ⚠️ Approve before selling
        </div>
        <button
          type="submit"
          disabled={isApproving}
          className={`px-6 py-2 w-full font-bold rounded-lg transition duration-300 shadow-lg ${
            isApproving 
              ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
        >
          {isApproving ? 'Approving...' : 'Approve Token'}
        </button>
      </form>
    </div>
  );
};

export default SellToken;
