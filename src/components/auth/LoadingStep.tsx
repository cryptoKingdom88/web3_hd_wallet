import React from "react";

const LoadingStep: React.FC = () => (
  <div className="loading-state text-center py-8">
    <p className="mb-2">Creating your wallet...</p>
    <div className="loading">Please wait...</div>
  </div>
);

export default LoadingStep;
