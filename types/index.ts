export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string | null
  role: string
  createdAt?: string
  updatedAt?: string
}

export interface CreditsInfo {
  total: number
  used: number
  remaining: number
  resetDate: string
}

export interface SubscriptionInfo {
  plan: string
  status: string
  startDate: string
  endDate: string | null
}

export interface ProjectItem {
  id: string
  title: string
  description: string
  type: string
  status: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface HistoryItem {
  id: string
  action: string
  details: string
  projectId: string | null
  metadata: unknown
  createdAt: string
}

export interface DashboardStats {
  user: AuthUser
  credits: CreditsInfo | null
  subscription: SubscriptionInfo | null
  recentProjects: ProjectItem[]
  recentHistory: HistoryItem[]
  totals: {
    projects: number
    completedProjects: number
    historyCount: number
    hasBusinessBrain: boolean
  }
}

export interface SettingsData {
  theme: string
  notifications: boolean
  language: string
  timezone: string
}

// ---------- AI Generator types ----------

export type GeneratedItem = Record<string, string>

export interface GenerationResult {
  toolId: string
  toolName: string
  inputs: Record<string, string>
  items: GeneratedItem[]
  createdAt?: string
}

export interface GenerateResponse {
  result: GenerationResult
  credits: CreditsInfo
}

export interface BusinessBrainData {
  businessName: string
  businessDescription: string
  industry: string
  products: string
  services: string
  targetAudience: string
  country: string
  language: string
  brandVoice: string
  contentGoals: string[]
  preferredPlatforms: string[]
}
