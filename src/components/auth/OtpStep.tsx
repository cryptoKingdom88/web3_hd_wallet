
import React from "react";
import { useForm } from "react-hook-form";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  email: string;
  verificationCode: string;
  setVerificationCode: (v: string) => void;
  isLoading: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (code: string) => void;
}


const OtpStep: React.FC<Props> = ({ verificationCode, setVerificationCode, isLoading, error, onBack, onSubmit }) => {
  const form = useForm({
    defaultValues: { code: verificationCode },
  });

  React.useEffect(() => {
    form.setValue("code", verificationCode);
  }, [verificationCode]);

  const handleSubmit = (values: { code: string }) => {
    onSubmit(values.code);
  };

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center">
          <Button variant="secondary" size="icon" className="size-8" onClick={onBack}>
            <ChevronLeftIcon />
          </Button>
          <CardTitle className="text-lg tracking-tight ml-4">Authentication Code</CardTitle>
        </div>
        <CardDescription className="mt-2">
          Please enter the authentication code. <br />
          We have sent the authentication code to your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }: { field: { value: string; onChange: (val: string) => void } }) => (
                <FormItem>
                  <FormControl>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={(val: string) => {
                          field.onChange(val);
                          setVerificationCode(val);
                        }}
                        disabled={isLoading}
                      >
                        <InputOTPGroup>
                          {[...Array(6)].map((_, idx) => (
                            <InputOTPSlot key={idx} index={idx} />
                          ))}
                        </InputOTPGroup>
                     </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              type="submit"
              className="w-full py-2 px-4 rounded-md bg-primary text-white font-semibold shadow hover:bg-primary/90 transition disabled:opacity-60"
              disabled={isLoading || !form.watch("code")?.trim()}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OtpStep;
