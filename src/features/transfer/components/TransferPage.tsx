import { TransferForm } from './TransferForm';
import { TransactionHistory } from './TransactionHistory';

export function TransferPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Send Transfer</h1>
          <p className="text-muted-foreground">
            Send Ethereum from your HD wallets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <TransferForm />
        
        {/* Transaction History */}
        <TransactionHistory />
      </div>
    </div>
  );
}