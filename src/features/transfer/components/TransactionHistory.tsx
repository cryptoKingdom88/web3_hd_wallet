import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: string;
  from: string;
  to: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  hash: string;
  gasUsed?: string;
  gasPrice?: string;
}

export function TransactionHistory() {
  // Demo transaction history - in real app, this would come from blockchain API
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'sent',
      amount: '0.5',
      from: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      to: '0x8D4C0532925a3b8D4C0532925a3b8D4C0532925a',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 3600000),
      hash: '0xabc123def456789...',
      gasUsed: '21000',
      gasPrice: '20'
    },
    {
      id: '2',
      type: 'received',
      amount: '1.0',
      from: '0x9E5C0532925a3b8D4C0532925a3b8D4',
      to: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 7200000),
      hash: '0xdef456ghi789abc...',
      gasUsed: '21000',
      gasPrice: '18'
    },
    {
      id: '3',
      type: 'sent',
      amount: '0.1',
      from: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      to: '0xABC123def456789abc123def456789abc123def4',
      status: 'pending',
      timestamp: new Date(Date.now() - 1800000),
      hash: '0xghi789abc123def...',
      gasPrice: '25'
    }
  ]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const openInExplorer = (hash: string) => {
    // Open transaction in Etherscan
    window.open(`https://etherscan.io/tx/${hash}`, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent Ethereum transactions</CardDescription>
      </CardHeader>
      
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  {/* Transaction Type Icon */}
                  <div className={`p-2 rounded-full ${
                    tx.type === 'sent' 
                      ? 'bg-red-100 dark:bg-red-900' 
                      : 'bg-green-100 dark:bg-green-900'
                  }`}>
                    <ArrowRight className={`h-4 w-4 ${
                      tx.type === 'sent' 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400 rotate-180'
                    }`} />
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{tx.type}</span>
                      <Badge className={getStatusColor(tx.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(tx.status)}
                          <span className="capitalize">{tx.status}</span>
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        {tx.type === 'sent' ? 'To' : 'From'}: 
                        <code className="ml-1 font-mono">{formatAddress(tx.type === 'sent' ? tx.to : tx.from)}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => copyToClipboard(tx.type === 'sent' ? tx.to : tx.from, 'Address')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span>{formatTime(tx.timestamp)}</span>
                        {tx.gasUsed && (
                          <span>Gas: {tx.gasUsed} @ {tx.gasPrice} Gwei</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="text-right space-y-2">
                  <div className={`font-bold text-lg ${
                    tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {tx.type === 'sent' ? '-' : '+'}{tx.amount} ETH
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tx.hash, 'Transaction Hash')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openInExplorer(tx.hash)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions found</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}