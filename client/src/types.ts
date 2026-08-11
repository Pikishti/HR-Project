export type Person = {
  id: string;
  name: string;
  email: string;
  title: string | null;
  department: string | null;
  avatarColor: string;
  status: "active" | "inactive";
  managerId: string | null;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: "active" | "archived";
  createdAt: string;
  sections?: Section[];
  tasks?: Task[];
  _count?: { tasks: number };
};

export type Section = {
  id: string;
  projectId: string;
  name: string;
  order: number;
};

export type Priority = "low" | "medium" | "high";

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type Comment = {
  id: string;
  taskId: string;
  authorId: string;
  author?: Person;
  body: string;
  createdAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  project?: Project;
  sectionId: string | null;
  parentTaskId: string | null;
  name: string;
  description: string | null;
  assigneeId: string | null;
  assignee?: Person | null;
  dueDate: string | null;
  priority: Priority;
  completed: boolean;
  order: number;
  createdAt: string;
  tags?: { tagId: string; taskId: string; tag: Tag }[];
  subtasks?: Task[];
  comments?: Comment[];
};

export type KpiPeriod = "weekly" | "monthly" | "quarterly" | "annual";
export type MetricStatus = "on-track" | "at-risk" | "off-track" | "done";

export type KpiSet = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  kpis?: Kpi[];
};

export type Kpi = {
  id: string;
  kpiSetId: string;
  name: string;
  metricUnit: string | null;
  targetValue: number;
  currentValue: number;
  personId: string | null;
  person?: Person | null;
  period: KpiPeriod;
  status: MetricStatus;
  createdAt: string;
};

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  owner?: Person;
  kpiId: string | null;
  kpi?: Kpi | null;
  targetDate: string | null;
  progress: number;
  status: MetricStatus;
  createdAt: string;
};

export type StrikeTier = {
  id: string;
  categoryId: string;
  name: string;
  level: number;
  consequenceDescription: string | null;
};

export type InfractionCategory = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  tiers: StrikeTier[];
};

export type StrikeRecord = {
  id: string;
  personId: string;
  person?: Person;
  categoryId: string;
  category?: InfractionCategory;
  tierId: string;
  tier?: StrikeTier;
  reason: string;
  issuedById: string | null;
  issuedBy?: Person | null;
  dateIssued: string;
  expiresAt: string | null;
  notes: string | null;
};
