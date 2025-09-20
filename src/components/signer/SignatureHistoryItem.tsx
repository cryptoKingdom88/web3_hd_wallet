
import React from 'react';
import { Button } from '@/components/ui/button';

interface SignatureHistoryItemProps {
  message: string;
  signature: string;
  timestamp: string;
  isVerified?: boolean;
  verifiedSigner?: string;
  onVerify?: () => void;
}

const SignatureHistoryItem: React.FC<SignatureHistoryItemProps> = ({
  message,
  signature,
  timestamp,
  isVerified = false,
  verifiedSigner,
  onVerify
}) => {
  return (
    <div className="history-item" style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="history-message" style={{ flex: 1 }}>
          <strong>Message:</strong> {message}
        </div>
        <span className="timestamp" style={{ marginLeft: 16, color: '#888', fontSize: 13 }}>{timestamp}</span>
      </div>
      <div className="history-signature">
        <div className="signature-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>
              Signature:
              {isVerified && verifiedSigner && (
                <span className="signer-address" style={{ marginLeft: 8 }}>{verifiedSigner}</span>
              )}
            </strong>
          </div>
          <div className="signature-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`verification-badge ${isVerified ? 'verified' : 'not-verified'}`} style={{ fontSize: 13, color: isVerified ? 'green' : 'gray' }}>
              {isVerified ? 'Verified' : 'Not Verified'}
            </span>
            {!isVerified && onVerify && (
              <Button size="sm" variant="outline" onClick={onVerify}>
                Verify
              </Button>
            )}
          </div>
        </div>
        <span className="signature-text" style={{ wordBreak: 'break-all', fontSize: 13 }}>{signature}</span>
      </div>
    </div>
  );
};

export default SignatureHistoryItem;