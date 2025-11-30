import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Navigation from "../components/layout/Navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "@radix-ui/react-label";
import { ArrowRight, Mail } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [step, setStep] = useState<string>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const emailMutation = useMutation<any, Error, string>({
    mutationFn: authService.sendOtp,
    onSuccess: () => {
      setStep("otp");
    },
  });

  const otpMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => authService.verifyOtp(data.email, data.otp),
    onSuccess: (data) => {
      login(data.data.token);
      navigate("/dashboard");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    emailMutation.mutate(email);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    otpMutation.mutate({ email, otp });
  };

  return (
    <>
      {/* <Navigation /> */}
      <div className="w-full text-center">
        <div className="flex justify-center h-screen items-center">
          <div className="w-[400px]  px-4">
            <div className="logo py-6 text-4xl">FLEX</div>
            <p className="text-muted-foreground">Create beautiful forms effortlessly</p>
            <div className="py-4">
              <Card className="bg-card border-border backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    {step === "email"
                      ? "Sign in to your account"
                      : "Enter verification code"}
                  </CardTitle>
                  <CardDescription>
                    {step === "email"
                      ? "Enter your email to receive a verification code"
                      : `We sent a 6-digit code to ${email}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {step === "email" ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="pl-10 bg-background border-input text-foreground focus:border-blue-violet-500"
                            required
                          />
                        </div>
                      </div>
                      {emailMutation.isError && (
                        <p className="text-red-500 text-sm">
                          {emailMutation.error instanceof Error ? emailMutation.error.message : "An error occurred"}
                        </p>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-blue-violet-600 hover:bg-blue-violet-700 text-white"
                          disabled={emailMutation.isPending}
                        >
                          {emailMutation.isPending ? "Sending..." : "Send verification code"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <Label>Verification Code</Label>
                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={setOtp}
                            className="gap-2"
                          >
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={0}
                                className="bg-background border-input text-foreground"
                              />
                              <InputOTPSlot
                                index={1}
                                className="bg-background border-input text-foreground"
                              />
                              <InputOTPSlot
                                index={2}
                                className="bg-background border-input text-foreground"
                              />
                            </InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={3}
                                className="bg-background border-input text-foreground"
                              />
                              <InputOTPSlot
                                index={4}
                                className="bg-background border-input text-foreground"
                              />
                              <InputOTPSlot
                                index={5}
                                className="bg-background border-input text-foreground"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        {otpMutation.isError && (
                          <p className="text-red-500 text-sm">
                            {otpMutation.error instanceof Error ? otpMutation.error.message : "An error occurred"}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground text-center">
                          For demo purposes, use:{" "}
                          <span className="text-blue-violet-400 font-mono">
                            123456
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            type="submit"
                            className="w-full bg-blue-violet-600 hover:bg-blue-violet-700 text-white"
                            disabled={otpMutation.isPending || otp.length !== 6}
                          >
                            {otpMutation.isPending ? "Verifying..." : "Verify and sign in"}
                          </Button>
                        </motion.div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-muted-foreground hover:text-foreground"
                          onClick={() => setStep("email")}
                        >
                          Back to email
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
