// Signature verification utilities for backend communication

export interface VerificationRequest {
  message: string;
  signature: string;
  walletAddress?: string;
}

export interface VerificationResponse {
  isValid: boolean;
  signer: string;
  originalMessage: string;
  error?: string;
}

// Backend API endpoint (will be configured later)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const verifySignature = async (
  message: string,
  signature: string,
): Promise<VerificationResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/verify-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        signature,
      } as VerificationRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: VerificationResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return {
      isValid: false,
      signer: '',
      originalMessage: message,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Note: Verification states are now stored directly in localStorage with the messages
// No need for separate session management