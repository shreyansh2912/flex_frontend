import { useState } from "react";
import Navigation from "../components/layout/Navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "@radix-ui/react-label";
import { ArrowRight, Mail } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";

export default function Login() {
  const [step, setStep] = useState<string>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("000000");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = ()=>{
    setStep("")
  }
  const handleOtpSubmit = ()=>{
    setStep("email")
  }

  return (
    <>
      <Navigation />
      <div className="w-full text-center">
        <div className="flex justify-center h-screen items-center">
          <div className="w-[400px]  px-4">
            <div className="logo py-6 text-4xl">FLEX</div>
            <p className="text-gray-400">Create beautiful forms effortlessly</p>
            <div className="py-4">
              <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">
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
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="pl-10 bg-gray-800 border-gray-600 text-white focus:border-blue-violet-500"
                            required
                          />
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          className="w-full bg-blue-violet-600 hover:bg-blue-violet-700"
                          disabled={isLoading}
                          onClick={handleEmailSubmit}
                        >
                          {isLoading ? "Sending..." : "Send verification code"}
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
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                              <InputOTPSlot
                                index={1}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                              <InputOTPSlot
                                index={2}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot
                                index={3}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                              <InputOTPSlot
                                index={4}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                              <InputOTPSlot
                                index={5}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <p className="text-sm text-gray-400 text-center">
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
                            className="w-full bg-blue-violet-600 hover:bg-blue-violet-700"
                            disabled={isLoading || otp.length !== 6}
                          >
                            {isLoading ? "Verifying..." : "Verify and sign in"}
                          </Button>
                        </motion.div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full text-gray-400 hover:text-white"
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
