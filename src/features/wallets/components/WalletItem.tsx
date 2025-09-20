import { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Wallet, 
  Copy, 
  Eye, 
  EyeOff,
  Send,
  QrCode,
  RefreshCw,
  Key
} from 'lucide-react';
import { toast } from 'sonner';
import type { WalletInfo } from '@/lib/hdWallet';
import { securityUtils } from '@/lib/encryption';

interface WalletItemProps {
  wallet: WalletInfo;
  onSend?: (wallet: WalletInfo) => void;
  onRefresh?: (wallet: WalletInfo) => void;
  onShowQR?: (wallet: WalletInfo) => void;
}

export function WalletItem({ wallet, onSend, onRefresh, onShowQR }: WalletItemProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh(wallet);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  const hasTokens = wallet.tokens && wallet.tokens.length > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow py-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="font-semibold">Wallet #{wallet.index} - {securityUtils.maskSensitiveData(wallet.address, 6)}</h3>
                <div className="ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(wallet.address, 'Address')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(wallet.address, 'Address')}
                  >
                    <Key className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                BIP-44 Derived (Path: {wallet.path})
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold">
              {formatBalance(wallet.balance)} ETH
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Token Balances */}
        {hasTokens && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Token Balances</h4>
            <div className="space-y-1">
              {wallet.tokens.map((token, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{token.symbol}</span>
                  <span>{formatBalance(token.balance)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet Address */}
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onSend?.(wallet)}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onShowQR?.(wallet)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Receive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}