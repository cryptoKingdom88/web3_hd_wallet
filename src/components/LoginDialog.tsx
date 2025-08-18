import React, { useState } from "react";
import { useConnectWithOtp, useDynamicContext } from "@dynamic-labs/sdk-react-core";

import EmailStep from "./auth/EmailStep";
import OtpStep from "./auth/OtpStep";
import LoadingStep from "./auth/LoadingStep";

const LoginDialog: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'loading'>('email');
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { sdkHasLoaded } = useDynamicContext();
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();

  const handleEmailSubmit = async (submittedEmail: string) => {
    if (!submittedEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await connectWithEmail(submittedEmail);
      setStep('otp');
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (code: string) => {
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await verifyOneTimePassword(code);
      setStep('loading');
    } catch (err: unknown) {
      setError((err as Error).message || "Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!sdkHasLoaded) {
    return (
      <div className="bg-primary-foreground container grid h-svh max-w-none items-center justify-center">
        <div className="text-lg font-semibold">Loading SDK...</div>
      </div>
    );
  }

    return (
      <div className='bg-primary-foreground container grid h-svh max-w-none items-center justify-center'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <img className='size-16' src='/src/assets/logo.png' alt='Logo' />
            <h1 className='text-3xl ml-4 font-extrabold'>Web3 Message Signer</h1>
          </div>
          {step === 'email' && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              isLoading={isLoading}
              error={error}
              onSubmit={handleEmailSubmit}
            />
          )}
          {step === 'otp' && (
            <OtpStep
              email={email}
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              isLoading={isLoading}
              error={error}
              onBack={() => { setStep('email'); setVerificationCode(""); setError(""); }}
              onSubmit={handleOtpSubmit}
            />
          )}
          {step === 'loading' && <LoadingStep />}
        </div>
      </div>
    );
  };

export default LoginDialog;
