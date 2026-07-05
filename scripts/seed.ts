import { PrismaClient, Role, PlanType, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "john@doe.com";
  const passwordHash = await bcrypt.hash("johndoe123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "John Doe",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Credits
  await prisma.credits.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      total: 2000,
      used: 340,
      remaining: 1660,
      resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Settings
  await prisma.settings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      theme: "dark",
      notifications: true,
      language: "English",
      timezone: "America/New_York",
    },
  });

  // Subscription
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plan: PlanType.PRO,
      status: SubscriptionStatus.ACTIVE,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Business Brain
  await prisma.businessBrain.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      businessName: "Northwind Studio",
      businessDescription:
        "A boutique creative studio helping founders turn ideas into standout brands and content.",
      industry: "Marketing & Advertising",
      products: "Brand kits, content templates, launch assets",
      services: "Brand strategy, content production, social media management",
      targetAudience: "Early-stage founders and solo creators aged 25-40 building online brands",
      country: "United States",
      language: "English",
      brandVoice: "Friendly",
      contentGoals: ["Grow audience", "Build brand awareness", "Drive engagement"],
      preferredPlatforms: ["Instagram", "LinkedIn", "YouTube", "TikTok"],
    },
  });

  // Sample projects (only when none exist)
  const projectCount = await prisma.project.count({ where: { userId: user.id } });
  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          userId: user.id,
          title: "Instagram launch caption",
          type: "social_post",
          status: "COMPLETED",
          content: "Big news is coming. Our new collection drops this Friday — be the first to see it.",
        },
        {
          userId: user.id,
          title: "Welcome email sequence",
          type: "email_campaign",
          status: "DRAFT",
          content: "Draft of a 3-part onboarding email series for new subscribers.",
        },
        {
          userId: user.id,
          title: "YouTube video script",
          type: "video_script",
          status: "COMPLETED",
          content: "A 5-minute script introducing our brand story and mission.",
        },
        {
          userId: user.id,
          title: "Blog post: 7 growth tips",
          type: "blog_post",
          status: "IN_PROGRESS",
          content: "Outline and intro for a long-form post on organic growth.",
        },
      ],
    });
  }

  // Sample history (only when none exist)
  const historyCount = await prisma.history.count({ where: { userId: user.id } });
  if (historyCount === 0) {
    await prisma.history.createMany({
      data: [
        { userId: user.id, action: "account.created", details: "Welcome to CreatorFuel AI" },
        { userId: user.id, action: "brain.updated", details: "Business Brain completed" },
        { userId: user.id, action: "project.created", details: "Created Instagram launch caption" },
        { userId: user.id, action: "project.created", details: "Created YouTube video script" },
      ],
    });
  }

  console.log("Seed complete for", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
