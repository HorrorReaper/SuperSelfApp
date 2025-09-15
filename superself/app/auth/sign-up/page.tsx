'use client';

import { useState } from "react";

import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    const handleSubmit = async() => {
        // Handle sign up logic here
        const { data, error } = await signUp(email, password, username, fullName, avatarUrl);
        if (error) {
            setError(error.message);
        }else{
            window.location.href = "/dashboard"; // Redirect to home page on success
        }
    };

    return (
        <Card className="w-full max-w-sm justify-center mx-auto mt-10">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
        <CardAction>
          <a href="/auth/sign-in"><Button variant="link">Login</Button></a>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="HorrorReaper"
                
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                type="text"
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                type="text"
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" onChange={(e) => setPassword(e.target.value)}required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" onClick={handleSubmit} className="w-full">
          SignUp
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
      {error && <p className="text-red-500">{error}</p>}
    </Card>
    );
}