"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { loadUserProfile } from "@/lib/user";

export function UserButton() {
  const [profile, setProfile] = useState(loadUserProfile());
  useEffect(() => {
    const onUpdate = () => setProfile(loadUserProfile());
    window.addEventListener("profile:updated", onUpdate);
    return () => window.removeEventListener("profile:updated", onUpdate);
  }, []);

  const initials =
    (profile?.name || "You")
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "YY";

  return (
    <Link
      href="/user"
      className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Open user settings"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile?.avatarUrl} alt={profile?.name ?? "User"} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
