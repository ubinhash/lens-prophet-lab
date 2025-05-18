// prediction-card.tsx
import React from "react";

const PredictionCard: React.FC = () => {
  const title = "BTC will be below $100,000 on June 20, 2025";
  const stake = "0.02";
  const body =
    "I think BTC will stay under $100K by June 2025. Trade wars are heating up, and global uncertainty makes people nervous. Not the vibe for big risk moves.";
  const prophet = "0×936...3410";

  return (
    <div className="w-full h-full bg-rose-200 rounded border-2 border-grey flex flex-col justify-between p-3">
      {/* Top Bar */}
      <div className="flex text-[14px] justify-between items-center font-semibold border-b border-black pb-1">
        <span>Latest Prediction</span>
        <span>{stake} ETH Staked</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-2 overflow-hidden">
        <h2 className="text-lg font-bold mb-1 mt-2">{title}</h2>
        <div className="text-sm max-h-16 overflow-y-auto pr-1">
          {body}
        </div>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <button className="bg-black text-white px-4 py-1 rounded font-bold">
          CHALLENGE
        </button>
        <span className="text-xs">Prophet By: {prophet}</span>
      </div>
    </div>
  );
};

export default PredictionCard;
