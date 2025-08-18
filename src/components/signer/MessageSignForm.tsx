import React, { useState, useEffect, useCallback } from "react";
import SignatureHistoryItem from "./SignatureHistoryItem";
import { verifySignature } from "@/utils/signatureVerification";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "dynamic-signed-messages";

interface SignedMessage {
  message: string;
  signature: string;
  timestamp: string;
  isVerified?: boolean;
  verifiedSigner?: string;
  walletAddress?: string;
}

const MessageSignForm = () => {
  const { primaryWallet } = useDynamicContext();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [signedMessages, setSignedMessages] = useState<SignedMessage[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load history from localStorage on mount and on storage event
  useEffect(() => {
    const readStorage = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSignedMessages(JSON.parse(stored));
      } else {
        setSignedMessages([]);
      }
      setInitialized(true);
    };
    readStorage();
    window.addEventListener('storage', readStorage);
    return () => window.removeEventListener('storage', readStorage);
  }, []);

  // Save to localStorage when signedMessages changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(signedMessages));
    }
  }, [signedMessages, initialized]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!primaryWallet || !message.trim()) {
      setError("Please enter a message to sign");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const messageToSign = String(message).trim();
      const signature = await primaryWallet.signMessage(messageToSign);
      if (!signature) throw new Error("No signature returned from wallet");
      const newSignedMessage: SignedMessage = {
        message: messageToSign,
        signature,
        timestamp: new Date().toLocaleString(),
        isVerified: false,
        walletAddress: primaryWallet.address,
      };
      setSignedMessages(prev => [newSignedMessage, ...prev]);
      setMessage("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign message";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSignedMessages([]);
  };

  const handleVerify = useCallback(async (idx: number) => {
    const item = signedMessages[idx];
    try {
      const result = await verifySignature(item.message, item.signature);
      setSignedMessages((prev) =>
        prev.map((msg, i) =>
          i === idx
            ? { ...msg, isVerified: result.isValid, verifiedSigner: result.signer }
            : msg
        )
      );
    } catch {
      // Optionally handle error
    }
  }, [signedMessages]);

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Sign Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Textarea
              value={message}
              onChange={(e) => setMessage(String(e.target.value))}
              placeholder="Enter your message to sign..."
              rows={4}
              disabled={isLoading}
              required
            />
            <Button
              type="submit"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? "Signing..." : "Sign"}
            </Button>
            {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
          </form>
        </CardContent>
      </Card>

      {signedMessages.length > 0 && (
        <Card className="mt-4">
          <CardHeader style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle>Message History</CardTitle>
            <Button variant="destructive" onClick={handleClear}>Clear History</Button>
          </CardHeader>
          <CardContent>
            {signedMessages.map((item, idx) => (
              <SignatureHistoryItem
                key={`${item.signature}-${idx}`}
                message={item.message}
                signature={item.signature}
                timestamp={item.timestamp}
                isVerified={item.isVerified}
                verifiedSigner={item.verifiedSigner}
                onVerify={() => handleVerify(idx)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default MessageSignForm;
