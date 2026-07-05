// ---------- Shared option lists & static config (serializable primitives only) ----------

export const INDUSTRIES: string[] = [
  'Technology & IT',
  'SaaS & Software',
  'E-commerce & Retail',
  'Health & Wellness',
  'Finance & Fintech',
  'Education & E-learning',
  'Real Estate',
  'Marketing & Advertising',
  'Food & Beverage',
  'Travel & Hospitality',
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Fitness & Sports',
  'Entertainment & Media',
  'Gaming & Esports',
  'Consulting & Coaching',
  'Manufacturing',
  'Automotive',
  'Nonprofit & NGO',
  'Legal Services',
  'Home & Interior',
  'Photography & Creative',
  'Music & Audio',
  'Other',
]

export const COUNTRIES: string[] = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Ireland',
  'Portugal', 'Switzerland', 'Austria', 'Belgium', 'Poland', 'Brazil', 'Mexico',
  'Argentina', 'India', 'Singapore', 'United Arab Emirates', 'Saudi Arabia',
  'South Africa', 'Nigeria', 'Kenya', 'Japan', 'South Korea', 'China',
  'Indonesia', 'Malaysia', 'Philippines', 'Vietnam', 'Thailand', 'Turkey',
  'New Zealand', 'Other',
]

export const LANGUAGES: string[] = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch',
  'Hindi', 'Arabic', 'Chinese (Mandarin)', 'Japanese', 'Korean', 'Russian',
  'Turkish', 'Indonesian', 'Vietnamese', 'Polish', 'Swedish',
]

export const BRAND_VOICES: string[] = [
  'Professional',
  'Casual',
  'Friendly',
  'Authoritative',
  'Playful',
]

export const CONTENT_GOALS: string[] = [
  'Brand Awareness',
  'Lead Generation',
  'Audience Engagement',
  'Product Launches',
  'Community Building',
  'Thought Leadership',
  'Sales & Conversions',
  'Customer Education',
  'Website Traffic',
  'Follower Growth',
]

export interface PlatformOption {
  id: string
  name: string
  icon: string // lucide icon name, mapped in client components
  color: string
}

export const PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E1306C' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok', color: '#000000' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'twitter', color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', color: '#1877F2' },
]

export const PLATFORM_NAMES: string[] = PLATFORMS.map((p) => p.name)

export interface ProjectTypeOption {
  id: string
  label: string
  icon: string
}

export const PROJECT_TYPES: ProjectTypeOption[] = [
  { id: 'blog_post', label: 'Blog Post', icon: 'FileText' },
  { id: 'social_post', label: 'Social Media Post', icon: 'Hash' },
  { id: 'video_script', label: 'Video Script', icon: 'Clapperboard' },
  { id: 'ad_copy', label: 'Ad Copy', icon: 'Megaphone' },
  { id: 'email_campaign', label: 'Email Campaign', icon: 'Mail' },
  { id: 'product_description', label: 'Product Description', icon: 'ShoppingBag' },
  { id: 'caption', label: 'Caption', icon: 'Quote' },
  { id: 'newsletter', label: 'Newsletter', icon: 'Newspaper' },
]

export function projectTypeLabel(id: string): string {
  return PROJECT_TYPES.find((t) => t.id === id)?.label ?? 'Content'
}

export const PROJECT_STATUSES: string[] = ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']

export interface PlanConfig {
  id: 'FREE' | 'STARTER' | 'EMPIRE'
  name: string
  price: number
  period: string
  tagline: string
  credits: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export const PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    period: 'forever',
    tagline: 'Perfect for trying things out',
    credits: '5 credits / month',
    features: [
      '5 generation credits monthly',
      'Access to all 7 AI generators',
      'Limited outputs per generation',
      '1 Business Brain profile',
      'Community support',
    ],
    cta: 'Start for free',
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: 19.99,
    period: 'month',
    tagline: 'For creators ready to scale',
    credits: '50 credits / month',
    features: [
      '50 generation credits monthly',
      'Full AI Generator access',
      'Complete outputs — 30 ideas, hooks & titles',
      'All platform descriptions & CTA categories',
      '30-day content calendars',
      'Unlimited Business Brain profiles',
    ],
    highlighted: true,
    cta: 'Upgrade to Starter',
  },
  {
    id: 'EMPIRE',
    name: 'Empire',
    price: 69.99,
    period: 'month',
    tagline: 'For serious brands & power users',
    credits: '150 credits / month',
    features: [
      '150 generation credits monthly',
      'Everything in Starter',
      'Priority generation queue',
      'Higher generation limits',
      'Premium Empire badge',
      'Priority support',
    ],
    cta: 'Go Empire',
  },
]

// ---------- AI Generator shared config ----------

export const TONES: string[] = [
  'Professional',
  'Casual',
  'Friendly',
  'Authoritative',
  'Playful',
  'Bold',
  'Inspirational',
  'Humorous',
  'Educational',
  'Conversational',
]

export const SCRIPT_DURATIONS: string[] = ['30 seconds', '45 seconds', '60 seconds']

export const GENERATOR_PLATFORMS: string[] = [
  'All Platforms',
  ...PLATFORMS.map((p) => p.name),
]

export const APP_NAME = 'CreatorFuel AI'
export const APP_TAGLINE = 'AI-powered content creation for creators & businesses'
