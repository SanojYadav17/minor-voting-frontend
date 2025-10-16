import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

const FundMarketplace = () => {
  const [transferring, setTransferring] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawingAll, setWithdrawingAll] = useState(false);

  const TOKEN_ADDRESS = import.meta.env.VITE_ERC20_TOKEN_ADDRESS;
  const MARKETPLACE_ADDRESS = import.meta.env.VITE_TOKEN_MARKETPLACE_ADDRESS;
  
  // All old marketplace addresses you deployed
  const OLD_MARKETPLACES = [
    "0xB69a1ddeeffB1706CcDd2d0E0969dc183ED5E882",
    "0xF7c33F7CB1224BFF0BDbcAF3a795745f382B1340",
    // Add more old addresses if you have them
  ];

  const transferTokensToMarketplace = async () => {
    try {
      setTransferring(true);
      
      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Token contract ABI
      const tokenAbi = [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address account) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      // Create contract instance
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);

      // Check current balance
      const userAddress = await signer.getAddress();
      const balance = await tokenContract.balanceOf(userAddress);
      console.log(`Your balance: ${ethers.formatEther(balance)} tokens`);

      if (balance === 0n) {
        toast.error("You don't have any tokens to transfer!", { icon: "❌" });
        setTransferring(false);
        return;
      }

      // Check if user has enough tokens
      const transferAmount = ethers.parseEther("100"); // Changed to 100 for testing
      
      if (balance < transferAmount) {
        toast.error(`Insufficient tokens! You have ${ethers.formatEther(balance)} tokens`, { icon: "❌" });
        setTransferring(false);
        return;
      }

      toast.loading("Transferring 100 tokens to marketplace...", { id: "transfer" });

      const tx = await tokenContract.transfer(MARKETPLACE_ADDRESS, transferAmount);
      console.log("Transaction sent:", tx.hash);

      await tx.wait();
      
      toast.dismiss("transfer");
      toast.success("✅ SUCCESS! Marketplace funded with 100 tokens!", {
        duration: 5000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold'
        }
      });

      // Verify marketplace balance
      const marketplaceBalance = await tokenContract.balanceOf(MARKETPLACE_ADDRESS);
      console.log(`Marketplace now has: ${ethers.formatEther(marketplaceBalance)} tokens`);

      toast.success(`Marketplace Balance: ${ethers.formatEther(marketplaceBalance)} tokens`, {
        duration: 5000,
        icon: "💰"
      });

      setTransferring(false);
    } catch (error) {
      setTransferring(false);
      toast.dismiss("transfer");
      console.error("Transfer error:", error);

      if (error.message.includes("user rejected")) {
        toast.error("Transaction cancelled by user", { icon: "⛔" });
      } else if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient balance to transfer!", { icon: "❌" });
      } else {
        toast.error("Error transferring tokens. Check console.", { icon: "❌" });
      }
    }
  };

  const checkMarketplaceBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const tokenAbi = [
        "function balanceOf(address account) view returns (uint256)"
      ];

      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
      const balance = await tokenContract.balanceOf(MARKETPLACE_ADDRESS);

      toast.success(`Marketplace has ${ethers.formatEther(balance)} tokens`, {
        duration: 5000,
        icon: "💰"
      });

      console.log(`Marketplace balance: ${ethers.formatEther(balance)} tokens`);
    } catch (error) {
      console.error("Error checking balance:", error);
      toast.error("Error checking balance", { icon: "❌" });
    }
  };

  const withdrawFromOldMarketplace = async (marketplaceAddress) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Old marketplace ABI
      const marketplaceAbi = [
        "function withdrawTokens(uint256 _amount) public",
        "function owner() public view returns (address)"
      ];

      const oldMarketplace = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer);

      // Check if user is owner
      const owner = await oldMarketplace.owner();
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        console.log(`Not owner of ${marketplaceAddress}`);
        return { success: false, reason: "not_owner" };
      }

      // Check old marketplace balance
      const tokenAbi = ["function balanceOf(address account) view returns (uint256)"];
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
      const oldBalance = await tokenContract.balanceOf(marketplaceAddress);

      if (oldBalance === 0n) {
        console.log(`No tokens in ${marketplaceAddress}`);
        return { success: false, reason: "no_balance" };
      }

      console.log(`Withdrawing ${ethers.formatEther(oldBalance)} tokens from ${marketplaceAddress}`);

      // Withdraw all tokens
      const tx = await oldMarketplace.withdrawTokens(oldBalance);
      await tx.wait();
      
      return { 
        success: true, 
        amount: ethers.formatEther(oldBalance),
        address: marketplaceAddress 
      };
    } catch (error) {
      console.error(`Error withdrawing from ${marketplaceAddress}:`, error);
      return { success: false, reason: "error", error };
    }
  };

  const withdrawFromAllOldMarketplaces = async () => {
    try {
      setWithdrawingAll(true);
      
      toast.loading("Scanning all addresses for tokens...", { id: "withdraw-all" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenAbi = ["function balanceOf(address) view returns (uint256)"];
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);

      // First, let's check ALL addresses to see where tokens are
      console.log("=== TOKEN BALANCE SCAN ===");
      const allAddressesToCheck = [
        ...OLD_MARKETPLACES,
        MARKETPLACE_ADDRESS, // Current marketplace
      ];

      for (const addr of allAddressesToCheck) {
        const bal = await tokenContract.balanceOf(addr);
        console.log(`${addr}: ${ethers.formatEther(bal)} tokens`);
      }

      // Now withdraw from old marketplaces
      let totalWithdrawn = 0n;
      const results = [];

      for (const marketplaceAddr of OLD_MARKETPLACES) {
        const result = await withdrawFromOldMarketplace(marketplaceAddr);
        if (result.success) {
          totalWithdrawn += ethers.parseEther(result.amount);
          results.push(`✅ ${result.amount} from ${result.address.slice(0, 10)}...`);
        }
      }

      toast.dismiss("withdraw-all");

      if (results.length === 0) {
        // Check user's personal balance
        const signer = await provider.getSigner();
        const userAddr = await signer.getAddress();
        const userBal = await tokenContract.balanceOf(userAddr);
        
        toast.error(
          <div>
            <div className="font-bold">No tokens found in old marketplaces!</div>
            <div className="text-sm mt-1">Your wallet has: {ethers.formatEther(userBal)} tokens</div>
          </div>,
          { 
            icon: "❌",
            duration: 8000
          }
        );
      } else {
        toast.success(
          <div>
            <div className="font-bold">✅ Withdrawn from {results.length} marketplace(s)!</div>
            <div className="text-sm mt-2">Total: {ethers.formatEther(totalWithdrawn)} tokens</div>
          </div>,
          {
            duration: 8000,
            style: {
              background: '#10B981',
              color: '#fff',
            }
          }
        );

        // Show details
        results.forEach(r => console.log(r));
      }

      setWithdrawingAll(false);
    } catch (error) {
      setWithdrawingAll(false);
      toast.dismiss("withdraw-all");
      console.error("Withdrawal error:", error);
      toast.error("Error withdrawing tokens. Check console.", { icon: "❌" });
    }
  };

  const withdrawFromSingleOldMarketplace = async () => {
    try {
      setWithdrawing(true);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Old marketplace ABI
      const marketplaceAbi = [
        "function withdrawTokens(uint256 _amount) public",
        "function owner() public view returns (address)"
      ];

      const marketplaceAddress = OLD_MARKETPLACES[0]; // First old marketplace
      const oldMarketplace = new ethers.Contract(marketplaceAddress, marketplaceAbi, signer);

      // Check if user is owner
      const owner = await oldMarketplace.owner();
      if (owner.toLowerCase() !== userAddress.toLowerCase()) {
        toast.error("You are not the owner of the old marketplace!", { icon: "❌" });
        setWithdrawing(false);
        return;
      }

      // Check old marketplace balance
      const tokenAbi = ["function balanceOf(address account) view returns (uint256)"];
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, provider);
      const oldBalance = await tokenContract.balanceOf(marketplaceAddress);

      if (oldBalance === 0n) {
        toast.error("Old marketplace has no tokens to withdraw!", { icon: "❌" });
        setWithdrawing(false);
        return;
      }

      console.log(`Old marketplace balance: ${ethers.formatEther(oldBalance)} tokens`);

      toast.loading(`Withdrawing ${ethers.formatEther(oldBalance)} tokens from old marketplace...`, { id: "withdraw" });

      // Withdraw all tokens
      const tx = await oldMarketplace.withdrawTokens(oldBalance);
      console.log("Withdrawal transaction sent:", tx.hash);

      await tx.wait();
      
      toast.dismiss("withdraw");
      toast.success(`✅ SUCCESS! Withdrawn ${ethers.formatEther(oldBalance)} tokens!`, {
        duration: 5000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold'
        }
      });

      // Check new balance
      const newBalance = await tokenContract.balanceOf(userAddress);
      console.log(`Your new balance: ${ethers.formatEther(newBalance)} tokens`);

      toast.success(`Your new balance: ${ethers.formatEther(newBalance)} tokens`, {
        duration: 5000,
        icon: "💰"
      });

      setWithdrawing(false);
    } catch (error) {
      setWithdrawing(false);
      toast.dismiss("withdraw");
      console.error("Withdrawal error:", error);

      if (error.message.includes("user rejected")) {
        toast.error("Transaction cancelled by user", { icon: "⛔" });
      } else if (error.message.includes("OwnableUnauthorizedAccount")) {
        toast.error("You are not the owner!", { icon: "❌" });
      } else {
        toast.error("Error withdrawing tokens. Check console.", { icon: "❌" });
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl rounded-xl p-8">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        🔧 Admin: Fund Marketplace
      </h2>

      <div className="bg-white rounded-lg p-6 mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          📍 Contract Addresses:
        </h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-700">
            <span className="font-bold text-blue-600">Token:</span>{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">
              {TOKEN_ADDRESS}
            </code>
          </p>
          <p className="text-gray-700">
            <span className="font-bold text-blue-600">Marketplace:</span>{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">
              {MARKETPLACE_ADDRESS}
            </code>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={withdrawFromAllOldMarketplaces}
          disabled={withdrawingAll}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg transform transition-all ${
            withdrawingAll
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 hover:scale-105"
          }`}
        >
          {withdrawingAll ? "⏳ Withdrawing from All..." : "🔥 Withdraw from ALL Old Marketplaces"}
        </button>

        <button
          onClick={withdrawFromSingleOldMarketplace}
          disabled={withdrawing}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg transform transition-all ${
            withdrawing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 hover:scale-105"
          }`}
        >
          {withdrawing ? "⏳ Withdrawing..." : "🔄 Withdraw from First Old Marketplace"}
        </button>

        <button
          onClick={transferTokensToMarketplace}
          disabled={transferring}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg transform transition-all ${
            transferring
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 hover:scale-105"
          }`}
        >
          {transferring ? "⏳ Transferring..." : "💸 Transfer 100 Tokens to New Marketplace"}
        </button>

        <button
          onClick={checkMarketplaceBalance}
          className="w-full py-3 px-6 rounded-lg font-semibold text-purple-600 bg-white hover:bg-gray-100 shadow-md transform transition-all hover:scale-105"
        >
          🔍 Check Marketplace Balance
        </button>
      </div>

      <div className="mt-6 bg-red-100 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-800 text-sm font-bold">
          🔥 <strong>Withdraw All:</strong> This will check all old marketplaces and withdraw tokens from each one automatically!
        </p>
      </div>

      <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
        <p className="text-yellow-800 text-sm font-bold">
          ⚠️ <strong>Steps:</strong> 1. Withdraw from old marketplaces → 2. Transfer to new marketplace
        </p>
      </div>

      <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-blue-800 text-sm font-bold mb-2">Old Marketplaces:</p>
        {OLD_MARKETPLACES.map((addr, idx) => (
          <p key={idx} className="text-blue-700 text-xs font-mono mb-1">
            {idx + 1}. {addr}
          </p>
        ))}
      </div>
    </div>
  );
};

export default FundMarketplace;
