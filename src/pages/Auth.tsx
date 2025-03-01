
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [montazUsername, setMontazUsername] = useState("");
  const [montazPassword, setMontazPassword] = useState("");
  const [activeTab, setActiveTab] = useState("standard");
  const { signIn, signUp, signInWithMontaz } = useAuth();

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  const handleMontazSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithMontaz(montazUsername, montazPassword);
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
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full">
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full"
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
                  <Label htmlFor="montazUsername">Montaz Username</Label>
                  <Input
                    id="montazUsername"
                    type="text"
                    value={montazUsername}
                    onChange={(e) => setMontazUsername(e.target.value)}
                    required
                    placeholder="Enter your Montaz username"
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
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Login with Montaz
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
