
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [montazEmail, setMontazEmail] = useState("");
  const [montazPassword, setMontazPassword] = useState("");
  const [activeTab, setActiveTab] = useState("standard");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, signInWithMontaz } = useAuth();
  const { toast } = useToast();

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMontazSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      console.log("Starting Montaz login process with:", montazEmail);
      
      // Show feedback to user
      toast({
        title: "Connecting to Montaz",
        description: "Please wait while we verify your credentials...",
      });
      
      await signInWithMontaz(montazEmail, montazPassword);
    } catch (error: any) {
      console.error("Montaz login error:", error);
      toast({
        title: "Montaz Login Error",
        description: error.message || "Failed to login with Montaz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create an account" : "Sign in to your account"}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Create a new account to get started" 
              : "Welcome back! Please enter your credentials"}
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Login</TabsTrigger>
            <TabsTrigger value="montaz">Montaz Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard">
            <form onSubmit={handleStandardSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    isSignUp ? "Sign Up" : "Sign In"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="montaz">
            <form onSubmit={handleMontazSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="montazEmail">Montaz Email</Label>
                  <Input
                    id="montazEmail"
                    type="email"
                    value={montazEmail}
                    onChange={(e) => setMontazEmail(e.target.value)}
                    required
                    placeholder="Enter your Montaz email"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montazPassword">Montaz Password</Label>
                  <Input
                    id="montazPassword"
                    type="password"
                    value={montazPassword}
                    onChange={(e) => setMontazPassword(e.target.value)}
                    required
                    placeholder="Enter your Montaz password"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting to Montaz...
                    </>
                  ) : (
                    "Login with Montaz"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
