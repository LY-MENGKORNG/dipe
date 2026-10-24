import { type PrismaTx } from "@common/database"
import type { Workspace, Project } from "../generated/client"

const projects: Omit<Project, "id" | "workspaceId">[] = [
  {
    name: "Default Project",
    description: "A default project for demonstration purposes.",
    budget: 10000.0,
    deadline: null,
    createdAt: new Date(),
  },
  {
    name: "Website Redesign",
    description: "Redesign the company website for a modern look.",
    budget: 5000.0,
    deadline: new Date("2024-12-31"),
    createdAt: new Date(),
  },
  {
    name: "Mobile App Development",
    description: "Develop a mobile application for our services.",
    budget: 20000.0,
    deadline: new Date("2025-06-30"),
    createdAt: new Date(),
  },
]

export async function projectSeed(tx: PrismaTx, workspaces: Workspace[]) {
  const seedProjects: Project[] = []

  for (const project of projects) {
    seedProjects.push(
      await tx.project.upsert({
        where: { name: project.name },
        update: {},
        create: {
          workspace: { connect: { id: workspaces[0].id } },
          ...project,
        },
      }),
    )
    console.log(`seeded project: ${project.name}`)
  }

  return seedProjects
}
