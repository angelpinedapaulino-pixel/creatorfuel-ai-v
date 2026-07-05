"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { User as UserIcon, Mail, Shield, Calendar, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import type { AuthUser } from "@/types";

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return "—";
  }
}

export default function ProfilePage() {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<AuthUser>("/api/user/profile");
        if (active && data) {
          setProfile(data);
          setName(data.name ?? "");
        }
      } catch {
        /* ignore */
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await apiFetch<AuthUser>("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      if (data) {
        setProfile(data);
        setUser(data);
      }
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = (profile?.name ?? profile?.email ?? "U")
    .split(" ")
    .map((p) => p?.[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl brand-gradient">
          <UserIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account details and personal information.</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full brand-gradient text-2xl font-bold text-white">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xl font-semibold">{profile?.name ?? "Creator"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email ?? ""}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
  setName(e.target.value)
} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={profile?.email ?? ""} disabled className="pl-10" />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account role</p>
              <p className="font-semibold capitalize">{(profile?.role ?? "user").toLowerCase()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="font-semibold">{formatDate(profile?.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
