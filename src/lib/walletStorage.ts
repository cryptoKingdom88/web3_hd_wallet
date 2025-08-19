
/**
 * Storage utilities for wallet data
 */
export const walletStorage = {
  getLastWalletIndex: (keyHash: string): number | null => {
    try {
      const stored = localStorage.getItem(`wallet-index-${keyHash}`);
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  },
  
  setLastWalletIndex: (keyHash: string, index: number): void => {
    try {
      localStorage.setItem(`wallet-index-${keyHash}`, index.toString());
    } catch (error) {
      console.error('Failed to save wallet index:', error);
    }
  },
  
  clearWalletData: (keyHash: string): void => {
    try {
      localStorage.removeItem(`wallet-index-${keyHash}`);
    } catch (error) {
      console.error('Failed to clear wallet data:', error);
    }
  }
};
