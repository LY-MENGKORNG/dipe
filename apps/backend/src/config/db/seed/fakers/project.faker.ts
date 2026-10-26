import type { Project, ProjectMember } from "@config/db/generated/client"

export const fakeProjects = [
  {
    id: Bun.randomUUIDv7(),
    name: "Default Project",
    description: "A default project for demonstration purposes.",
    budget: 3_000_000.0,
    currency: "KHR",
    deadline: null,
    createdAt: new Date(),
    workspaceId: 1,
  },
  {
    id: Bun.randomUUIDv7(),
    name: "Website Redesign",
    description: "Redesign the company website for a modern look.",
    budget: 5_000_000.0,
    currency: "KHR",
    deadline: new Date("2024-12-31"),
    createdAt: new Date(),
    workspaceId: 1,
  },
  {
    id: Bun.randomUUIDv7(),
    name: "Mobile App Development",
    description: "Develop a mobile application for our services.",
    budget: 2_000_000.0,
    currency: "KHR",
    deadline: new Date("2025-06-30"),
    createdAt: new Date(),
    workspaceId: 2,
  },
] as const satisfies Project[]

export const fakeProjectMembers = [
  { projectName: fakeProjects[0].name, memberId: 1, role: "LEAD" },
  { projectName: fakeProjects[0].name, memberId: 2, role: "DEVELOPER" },
  { projectName: fakeProjects[1].name, memberId: 1, role: "LEAD" },
  { projectName: fakeProjects[1].name, memberId: 3, role: "DESIGNER" },
  { projectName: fakeProjects[2].name, memberId: 2, role: "LEAD" },
] as const satisfies (Omit<ProjectMember, "projectId"> & {
  projectName: string
})[]
