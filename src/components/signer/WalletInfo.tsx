
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

const WalletInfo = () => {
  const { user, primaryWallet, handleLogOut } = useDynamicContext();
  return (
    <Card>
      <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <CardTitle>Connected Wallet</CardTitle>
          <CardDescription>Wallet and user information</CardDescription>
        </div>
        <CardAction>
          <Button variant="outline" onClick={handleLogOut}>Logout</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {user?.email && (
          <div style={{ marginBottom: 8 }}>
            <strong>Email:</strong> <span>{user.email}</span>
          </div>
        )}
        {primaryWallet?.address && (
          <div style={{ marginBottom: 8 }}>
            <strong>Address:</strong> <span>{primaryWallet.address}</span>
          </div>
        )}
        {!user?.email && !primaryWallet?.address && <div>Unknown</div>}
      </CardContent>
    </Card>
  );
};

export default WalletInfo;
