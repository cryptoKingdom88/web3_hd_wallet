import { useState } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  Send, 
  ArrowRight,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { validateEmail } from '@/lib/stringUtils';
import { ethers } from 'ethers';

interface TransferFormData {
  fromWalletIndex: number;
  toAddress: string;
  amount: string;
  gasPrice: string;
  memo: string;
}

export function TransferForm() {
  const { wallets, getMasterKey } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<TransferFormData>({
    fromWalletIndex: wallets.length > 0 ? wallets[0].index : 0,
    toAddress: '',
    amount: '',
    gasPrice: '20',
    memo: ''
  });

  const handleInputChange = (field: keyof TransferFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.toAddress) {
      toast.error('Recipient address is required');
      return false;
    }

    if (!ethers.isAddress(formData.toAddress)) {
      toast.error('Invalid Ethereum address');
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return false;
    }

    const selectedWallet = wallets.find(w => w.index === formData.fromWalletIndex);
    if (!selectedWallet) {
      toast.error('Selected wallet not found');
      return false;
    }

    const walletBalance = parseFloat(selectedWallet.balance || '0');
    const transferAmount = parseFloat(formData.amount);
    
    if (transferAmount > walletBalance) {
      toast.error('Insufficient balance');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Actually blockchain transaction sending logic would go here
      // For now, simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Transaction submitted successfully!');
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        toAddress: '',
        amount: '',
        memo: ''
      }));
      
    } catch (error) {
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWallet = wallets.find(w => w.index === formData.fromWalletIndex);
  const availableBalance = selectedWallet?.balance || '0';

  if (wallets.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Wallets Available</h3>
              <p className="text-muted-foreground">
                You need at least one wallet to send transactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Send Ethereum</span>
        </CardTitle>
        <CardDescription>
          Send ETH from your HD wallet to another address
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* From Wallet Selection */}
          <div className="space-y-2">
            <Label htmlFor="fromWallet">From Wallet</Label>
            <Select 
              value={formData.fromWalletIndex.toString()} 
              onValueChange={(value) => handleInputChange('fromWalletIndex', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.index} value={wallet.index.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>Wallet #{wallet.index}</span>
                      <span className="text-sm text-muted-foreground ml-4">
                        {parseFloat(wallet.balance || '0').toFixed(4)} ETH
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Available: {parseFloat(availableBalance).toFixed(4)} ETH
            </p>
          </div>

          {/* To Address */}
          <div className="space-y-2">
            <Label htmlFor="toAddress">To Address</Label>
            <Input
              id="toAddress"
              placeholder="0x..."
              value={formData.toAddress}
              onChange={(e) => handleInputChange('toAddress', e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="0.0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                ETH
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('amount', (parseFloat(availableBalance) * 0.25).toString())}
              >
                25%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('amount', (parseFloat(availableBalance) * 0.5).toString())}
              >
                50%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('amount', (parseFloat(availableBalance) * 0.75).toString())}
              >
                75%
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleInputChange('amount', (parseFloat(availableBalance) * 0.95).toString())}
              >
                Max
              </Button>
            </div>
          </div>

          {/* Gas Price */}
          <div className="space-y-2">
            <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
            <Input
              id="gasPrice"
              type="number"
              placeholder="20"
              value={formData.gasPrice}
              onChange={(e) => handleInputChange('gasPrice', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Higher gas price = faster transaction confirmation
            </p>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Input
              id="memo"
              placeholder="Transaction note..."
              value={formData.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
            />
          </div>

          {/* Transaction Summary */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Transaction Summary</h4>
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span>{formData.amount} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Gas:</span>
                <span>~0.001 ETH</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Total:</span>
                <span>~{(parseFloat(formData.amount) + 0.001).toFixed(6)} ETH</span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <ArrowRight className="h-4 w-4 mr-2 animate-pulse" />
                Sending Transaction...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Transaction
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}