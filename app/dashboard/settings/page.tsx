"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES } from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import type { SettingsData } from "@/types";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/La_Paz",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function SettingsPage() {
  const { setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SettingsData>({
    theme: "dark",
    notifications: true,
    language: "English",
    timezone: "UTC",
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiFetch<SettingsData>("/api/user/settings");
        if (active && data) {
          setForm({
            theme: data.theme ?? "dark",
            notifications: data.notifications ?? true,
            language: data.language ?? "English",
            timezone: data.timezone ?? "UTC",
          });
        }
      } catch {
        /* keep defaults */
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
      await apiFetch<SettingsData>("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (form?.theme) setTheme(form.theme);
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save settings");
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

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl brand-gradient">
          <SettingsIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage how the application looks and communicates with you.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose the interface theme for your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={form?.theme ?? "dark"} onValueChange={(v: string) =>
  setForm((f) => ({ ...(f ?? {}), theme: v }))
}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control which messages land in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Email notifications</p>
              <p className="text-sm text-muted-foreground">Activity summaries, product news and account alerts.</p>
            </div>
            <Switch
              checked={form?.notifications ?? false}
              onCheckedChange={(v: boolean) =>
  setForm((f) => ({ ...(f ?? {}), notifications: v }))
}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Set your preferred language and timezone.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={form?.language ?? "English"} onValueChange={(v: string) =>
  setForm((f) => ({ ...(f ?? {}), language: v }))
}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {(LANGUAGES ?? []).map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select value={form?.timezone ?? "UTC"} onValueChange={(v: string) =>
  setForm((f) => ({ ...(f ?? {}), timezone: v }))
}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {(TIMEZONES ?? []).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
