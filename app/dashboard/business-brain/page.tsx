"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  INDUSTRIES,
  COUNTRIES,
  LANGUAGES,
  BRAND_VOICES,
  CONTENT_GOALS,
  PLATFORMS,
} from "@/lib/constants";
import { apiFetch } from "@/lib/api-client";
import type { BusinessBrainData } from "@/types";

const STEPS = [
  "Business basics",
  "Industry & offerings",
  "Audience & reach",
  "Brand voice & goals",
  "Platforms",
  "Review",
];

const PLATFORM_NAMES = (PLATFORMS ?? []).map((p: any) => p?.name ?? p).filter(Boolean);

type FormState = {
  businessName: string;
  businessDescription: string;
  industry: string;
  products: string;
  services: string;
  targetAudience: string;
  country: string;
  language: string;
  brandVoice: string;
  contentGoals: string[];
  preferredPlatforms: string[];
};

const EMPTY: FormState = {
  businessName: "",
  businessDescription: "",
  industry: "",
  products: "",
  services: "",
  targetAudience: "",
  country: "",
  language: "English",
  brandVoice: "",
  contentGoals: [],
  preferredPlatforms: [],
};

export default function BusinessBrainPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await apiFetch<BusinessBrainData | null>("/api/business-brain");
        if (active && d && d.businessName) {
          setHasExisting(true);
          setForm({
          businessName: d.businessName ?? "",
          businessDescription: d.businessDescription ?? "",
          industry: d.industry ?? "",
          products: d.products ?? "",
          services: d.services ?? "",
          targetAudience: d.targetAudience ?? "",
          country: d.country ?? "",
          language: d.language ?? "English",
          brandVoice: d.brandVoice ?? "",
            contentGoals: d.contentGoals ?? [],
            preferredPlatforms: d.preferredPlatforms ?? [],
          });
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

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...(f ?? EMPTY), ...patch }));

  const toggleGoal = (goal: string) =>
    setForm((f) => {
      const list = f?.contentGoals ?? [];
      return {
        ...(f ?? EMPTY),
        contentGoals: list.includes(goal) ? list.filter((g) => g !== goal) : [...list, goal],
      };
    });

  const togglePlatform = (name: string) =>
    setForm((f) => {
      const list = f?.preferredPlatforms ?? [];
      return {
        ...(f ?? EMPTY),
        preferredPlatforms: list.includes(name) ? list.filter((p) => p !== name) : [...list, name],
      };
    });

  const canNext = useMemo(() => {
    if (step === 0) return !!form?.businessName?.trim() && !!form?.businessDescription?.trim();
    if (step === 1) return !!form?.industry;
    if (step === 2) return !!form?.targetAudience?.trim() && !!form?.country;
    if (step === 3) return !!form?.brandVoice && (form?.contentGoals?.length ?? 0) > 0;
    if (step === 4) return (form?.preferredPlatforms?.length ?? 0) > 0;
    return true;
  }, [step, form]);

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await apiFetch<BusinessBrainData>("/api/business-brain", {
        method: hasExisting ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      toast.success("Business Brain saved");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
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
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business Brain</h1>
          <p className="text-sm text-muted-foreground">
            Teach the application about your brand so every output sounds like you.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-muted-foreground">{STEPS[step]}</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardContent className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {step === 0 && (
  <>
    <div className="space-y-2">
      <Label htmlFor="bn">Business name</Label>

      <Input
  id="bn"
  value={form?.businessName ?? ""}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
    set({ businessName: e.target.value })
  }
  placeholder="e.g. Northwind Studio"
/>
    </div>

    <div className="space-y-2">
      <Label htmlFor="bd">Business description</Label>

      <Textarea
        id="bd"
        rows={5}
                      value={form?.businessDescription ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
  set({ businessDescription: e.target.value })
}
                      placeholder="Describe what your business does and what makes it unique."
                    />
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={form?.industry ?? ""} onValueChange={(v: string) => set({ industry: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {(INDUSTRIES ?? []).map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pr">Products</Label>
                    <Textarea
                      id="pr"
                      rows={3}
                      value={form?.products ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
  set({ products: e.target.value })
}
                      placeholder="List your key products (optional)."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sv">Services</Label>
                    <Textarea
                      id="sv"
                      rows={3}
                      value={form?.services ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
  set({ services: e.target.value })
}
                      placeholder="List your key services (optional)."
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ta">Target audience</Label>
                    <Textarea
                      id="ta"
                      rows={4}
                      value={form?.targetAudience ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
  set({ targetAudience: e.target.value })
}
                      placeholder="Who are you trying to reach? Describe demographics and interests."
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Country / market</Label>
                      <Select value={form?.country ?? ""} onValueChange={(v: string) => set({ country: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {(COUNTRIES ?? []).map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary language</Label>
                      <Select value={form?.language ?? "English"} onValueChange={(v: string) => set({ language: v })}>
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
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-3">
                    <Label>Brand voice</Label>
                    <RadioGroup
                      value={form?.brandVoice ?? ""}
                      onVonValueChange={(v: string) => set({ brandVoice: v })}
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      {(BRAND_VOICES ?? []).map((v) => (
                        <Label
                          key={v}
                          htmlFor={`voice-${v}`}
                          className="flex cursor-pointer items-center gap-3 rounded-xl bg-muted/40 p-3 transition hover:bg-muted"
                        >
                          <RadioGroupItem value={v} id={`voice-${v}`} />
                          <span>{v}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-3">
                    <Label>Content goals</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(CONTENT_GOALS ?? []).map((g) => (
                        <Label
                          key={g}
                          htmlFor={`goal-${g}`}
                          className="flex cursor-pointer items-center gap-3 rounded-xl bg-muted/40 p-3 transition hover:bg-muted"
                        >
                          <Checkbox
                            id={`goal-${g}`}
                            checked={(form?.contentGoals ?? []).includes(g)}
                            onCheckedChange={() => toggleGoal(g)}
                          />
                          <span>{g}</span>
                        </Label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  <Label>Preferred platforms</Label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(PLATFORM_NAMES ?? []).map((name: string) => {
                      const active = (form?.preferredPlatforms ?? []).includes(name);
                      return (
                        <button
                          key={name}
                          type={"button" as const}
                          onClick={() => togglePlatform(name)}
                          className={`flex items-center justify-between rounded-xl p-3 text-left transition ${
                            active ? "brand-gradient text-white" : "bg-muted/40 hover:bg-muted"
                          }`}
                        >
                          <span>{name}</span>
                          {active && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                    <p className="font-medium">Review your Business Brain</p>
                  </div>
                  <dl className="space-y-3 text-sm">
                    <ReviewRow label="Business" value={form?.businessName} />
                    <ReviewRow label="Description" value={form?.businessDescription} />
                    <ReviewRow label="Industry" value={form?.industry} />
                    <ReviewRow label="Products" value={form?.products} />
                    <ReviewRow label="Services" value={form?.services} />
                    <ReviewRow label="Audience" value={form?.targetAudience} />
                    <ReviewRow label="Country" value={form?.country} />
                    <ReviewRow label="Language" value={form?.language} />
                    <ReviewRow label="Brand voice" value={form?.brandVoice} />
                    <ReviewRow label="Goals" value={(form?.contentGoals ?? []).join(", ")} />
                    <ReviewRow label="Platforms" value={(form?.preferredPlatforms ?? []).join(", ")} />
                  </dl>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || saving}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {hasExisting ? "Update Business Brain" : "Save Business Brain"}
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/30 p-3 sm:flex-row sm:gap-4">
      <dt className="w-32 shrink-0 font-medium text-muted-foreground">{label}</dt>
      <dd className="flex-1 break-words">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}
