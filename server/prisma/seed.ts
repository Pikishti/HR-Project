import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.strikeRecord.deleteMany();
  await prisma.strikeTier.deleteMany();
  await prisma.infractionCategory.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.kpi.deleteMany();
  await prisma.kpiSet.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.section.deleteMany();
  await prisma.project.deleteMany();
  await prisma.person.deleteMany();

  const ceo = await prisma.person.create({
    data: { name: "Jordan Blake", email: "jordan@datasparkhr.com", title: "CEO", department: "Executive", avatarColor: "#6366f1" },
  });
  const cto = await prisma.person.create({
    data: { name: "Priya Nair", email: "priya@datasparkhr.com", title: "CTO", department: "Engineering", avatarColor: "#0ea5e9", managerId: ceo.id },
  });
  const coo = await prisma.person.create({
    data: { name: "Marcus Lee", email: "marcus@datasparkhr.com", title: "COO", department: "Operations", avatarColor: "#f59e0b", managerId: ceo.id },
  });
  const engManager = await prisma.person.create({
    data: { name: "Ava Thompson", email: "ava@datasparkhr.com", title: "Engineering Manager", department: "Engineering", avatarColor: "#10b981", managerId: cto.id },
  });
  const salesManager = await prisma.person.create({
    data: { name: "Diego Ramirez", email: "diego@datasparkhr.com", title: "Sales Manager", department: "Sales", avatarColor: "#ef4444", managerId: coo.id },
  });
  const dev1 = await prisma.person.create({
    data: { name: "Sam Carter", email: "sam@datasparkhr.com", title: "Software Engineer", department: "Engineering", avatarColor: "#8b5cf6", managerId: engManager.id },
  });
  const dev2 = await prisma.person.create({
    data: { name: "Nina Volkov", email: "nina@datasparkhr.com", title: "Software Engineer", department: "Engineering", avatarColor: "#ec4899", managerId: engManager.id },
  });
  const rep1 = await prisma.person.create({
    data: { name: "Liam O'Connor", email: "liam@datasparkhr.com", title: "Account Executive", department: "Sales", avatarColor: "#14b8a6", managerId: salesManager.id },
  });

  const project = await prisma.project.create({
    data: {
      name: "Website Relaunch",
      description: "Redesign and rebuild the marketing site",
      color: "#6366f1",
      sections: {
        create: [
          { name: "To Do", order: 0 },
          { name: "In Progress", order: 1 },
          { name: "Done", order: 2 },
        ],
      },
    },
    include: { sections: true },
  });
  const [todo, inProgress, done] = project.sections;

  const tagUrgent = await prisma.tag.create({ data: { name: "Urgent", color: "#ef4444" } });
  const tagDesign = await prisma.tag.create({ data: { name: "Design", color: "#8b5cf6" } });

  await prisma.task.create({
    data: {
      projectId: project.id,
      sectionId: todo.id,
      name: "Wireframe homepage",
      description: "Draft low-fi wireframes for the new homepage layout",
      assigneeId: dev1.id,
      priority: "high",
      order: 0,
      dueDate: new Date(Date.now() + 3 * 86400000),
      tags: { create: [{ tagId: tagDesign.id }] },
    },
  });
  await prisma.task.create({
    data: {
      projectId: project.id,
      sectionId: inProgress.id,
      name: "Set up CI/CD pipeline",
      assigneeId: dev2.id,
      priority: "medium",
      order: 0,
      dueDate: new Date(Date.now() + 5 * 86400000),
      tags: { create: [{ tagId: tagUrgent.id }] },
    },
  });
  await prisma.task.create({
    data: {
      projectId: project.id,
      sectionId: done.id,
      name: "Kickoff meeting",
      assigneeId: engManager.id,
      priority: "low",
      completed: true,
      order: 0,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Q3 Sales Push",
      description: "Coordinate outbound campaign for Q3",
      color: "#f59e0b",
      sections: {
        create: [
          { name: "To Do", order: 0 },
          { name: "In Progress", order: 1 },
          { name: "Done", order: 2 },
        ],
      },
    },
    include: { sections: true },
  });
  await prisma.task.create({
    data: {
      projectId: project2.id,
      sectionId: project2.sections[0].id,
      name: "Build target account list",
      assigneeId: rep1.id,
      priority: "high",
      order: 0,
      dueDate: new Date(Date.now() + 2 * 86400000),
    },
  });

  const kpiSet = await prisma.kpiSet.create({
    data: { name: "Engineering — Q3 KPIs", description: "Core delivery metrics for the engineering org" },
  });
  await prisma.kpi.create({
    data: {
      kpiSetId: kpiSet.id,
      name: "Sprint velocity",
      metricUnit: "story points",
      targetValue: 40,
      currentValue: 32,
      personId: engManager.id,
      period: "quarterly",
      status: "on-track",
    },
  });
  await prisma.kpi.create({
    data: {
      kpiSetId: kpiSet.id,
      name: "Bug escape rate",
      metricUnit: "%",
      targetValue: 2,
      currentValue: 3.5,
      personId: dev1.id,
      period: "monthly",
      status: "at-risk",
    },
  });

  await prisma.goal.create({
    data: {
      title: "Ship v2 of onboarding flow",
      description: "Reduce time-to-first-value for new signups",
      ownerId: engManager.id,
      targetDate: new Date(Date.now() + 45 * 86400000),
      progress: 40,
      status: "on-track",
    },
  });
  await prisma.goal.create({
    data: {
      title: "Close $500k in new ARR",
      ownerId: salesManager.id,
      targetDate: new Date(Date.now() + 60 * 86400000),
      progress: 25,
      status: "at-risk",
    },
  });

  const attendance = await prisma.infractionCategory.create({
    data: {
      name: "Attendance",
      description: "Unexcused absences and tardiness",
      tiers: {
        create: [
          { name: "Verbal Warning", level: 1, consequenceDescription: "Informal conversation with manager, documented" },
          { name: "Written Warning", level: 2, consequenceDescription: "Formal written warning placed in file" },
          { name: "Suspension", level: 3, consequenceDescription: "Unpaid 3-day suspension" },
          { name: "Termination", level: 4, consequenceDescription: "Termination of employment" },
        ],
      },
    },
    include: { tiers: true },
  });

  const conduct = await prisma.infractionCategory.create({
    data: {
      name: "Conduct",
      description: "Workplace conduct and policy violations",
      tiers: {
        create: [
          { name: "Coaching Note", level: 1, consequenceDescription: "Documented coaching conversation" },
          { name: "Formal Reprimand", level: 2, consequenceDescription: "Written reprimand, HR copied" },
          { name: "Final Warning", level: 3, consequenceDescription: "Final written warning, PIP initiated" },
        ],
      },
    },
    include: { tiers: true },
  });

  await prisma.strikeRecord.create({
    data: {
      personId: dev2.id,
      categoryId: attendance.id,
      tierId: attendance.tiers[0].id,
      reason: "Arrived over an hour late without notice",
      issuedById: engManager.id,
      notes: "First occurrence, discussed expectations going forward",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
