import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../../../components/ui/button';
import { WalletItem } from './WalletItem';
import { 
  Plus, 
  RefreshCw,
  Wallet as WalletIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { generateHDWallet, checkWalletBalance } from '@/lib/hdWallet';
import type { WalletInfo } from '@/lib/hdWallet';

export function WalletsList() {
  const { 
    wallets, 
    lastWalletIndex, 
    getMasterKey, 
    addWallets, 
    updateWalletBalance 
  } = useAuthStore();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  // Load balances on component mount
  useEffect(() => {
    if (wallets.length > 0) {
      refreshAllBalances();
    }
  }, []);

  const refreshAllBalances = async () => {
    setIsRefreshing(true);
    
    try {
      const balancePromises = wallets.map(async (wallet) => {
        try {
          const balance = await checkWalletBalance(wallet.address);
          updateWalletBalance(wallet.address, balance);
        } catch (error) {
          console.error(`Failed to refresh balance for ${wallet.address}:`, error);
        }
      });
      
      await Promise.all(balancePromises);
      toast.success('Balances refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh some balances ' + error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshWalletBalance = async (wallet: WalletInfo) => {
    try {
      const balance = await checkWalletBalance(wallet.address);
      updateWalletBalance(wallet.address, balance);
      toast.success(`Balance updated for Wallet #${wallet.index}`);
    } catch (error) {
      toast.error('Failed to refresh balance ' + error);
    }
  };

  const addNewWallet = async () => {
    const masterKey = getMasterKey();
    if (!masterKey) {
      toast.error('Master key not available');
      return;
    }

    setIsAddingWallet(true);
    
    try {
      const newIndex = lastWalletIndex + 1;
      const newWallet = generateHDWallet(masterKey, newIndex);
      
      // Check balance for the new wallet
      const balance = await checkWalletBalance(newWallet.address);
      newWallet.balance = balance;
      
      addWallets([newWallet]);
      toast.success(`New wallet #${newIndex} added successfully`);
    } catch (error) {
      toast.error('Failed to add new wallet ' + error);
    } finally {
      setIsAddingWallet(false);
    }
  };

  const handleSendFromWallet = (wallet: WalletInfo) => {
    // Navigate to transfer page with selected wallet
    // This would be implemented with router navigation
    toast.info(`Send from Wallet #${wallet.index} - Feature coming soon`);
  };

  const handleShowQR = (wallet: WalletInfo) => {
    // Show QR code modal
    toast.info(`QR Code for Wallet #${wallet.index} - Feature coming soon`);
  };

  const getTotalBalance = (): string => {
    const total = wallets.reduce((sum, wallet) => {
      return sum + parseFloat(wallet.balance || '0');
    }, 0);
    return total.toFixed(4);
  };

  const getActiveWalletsCount = (): number => {
    return wallets.filter(wallet => parseFloat(wallet.balance || '0') > 0).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My HD Wallets</h1>
          <p className="text-muted-foreground">
            BIP-44 derived Ethereum wallets
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={refreshAllBalances}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Button onClick={addNewWallet} disabled={isAddingWallet}>
            <Plus className="h-4 w-4 mr-2" />
            {isAddingWallet ? 'Adding...' : 'Add Wallet'}
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {getTotalBalance()} ETH
              </p>
              <p className="text-sm text-muted-foreground">Total Balance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{wallets.length}</p>
              <p className="text-sm text-muted-foreground">Total Wallets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{getActiveWalletsCount()}</p>
              <p className="text-sm text-muted-foreground">Active Wallets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets Grid */}
      {wallets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {wallets.map((wallet) => (
            <WalletItem
              key={wallet.index}
              wallet={wallet}
              onSend={handleSendFromWallet}
              onRefresh={refreshWalletBalance}
              onShowQR={handleShowQR}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <WalletIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Wallets Found</h3>
                <p className="text-muted-foreground">
                  Click "Add Wallet" to create your first HD wallet
                </p>
              </div>
              <Button onClick={addNewWallet} disabled={isAddingWallet}>
                <Plus className="h-4 w-4 mr-2" />
                {isAddingWallet ? 'Creating...' : 'Create First Wallet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}