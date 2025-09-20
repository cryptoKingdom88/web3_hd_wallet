
import React from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";


type Props = {
  email: string;
  setEmail: (v: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (email: string) => void;
};


const EmailStep: React.FC<Props> = ({ email, setEmail, isLoading, error, onSubmit }) => {
  const form = useForm({
    defaultValues: { email },
  });

  React.useEffect(() => {
    form.setValue("email", email);
  }, [email]);

  const handleSubmit = (values: { email: string }) => {
    onSubmit(values.email);
  };

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-lg tracking-tight">Login</CardTitle>
        <CardDescription>
          Enter your email to log in or sign up
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      disabled={isLoading}
                      required
                      {...field}
                      onChange={e => {
                        field.onChange(e);
                        setEmail(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              type="submit"
              className="w-full py-2 px-4 rounded-md bg-primary text-white font-semibold shadow hover:bg-primary/90 transition disabled:opacity-60"
              disabled={isLoading || !form.watch("email")?.trim()}
            >
              {isLoading ? "Sending..." : "Log In"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EmailStep;
