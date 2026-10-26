import type { PrismaTx } from "@common/database"
import { fakeProjectMembers, fakeProjects } from "./fakers/project.faker"

export async function projectSeed(tx: PrismaTx) {
  await tx.project.createMany({ data: fakeProjects, skipDuplicates: true })

  const projects = await tx.project.findMany({
    where: { name: { in: fakeProjects.map((p) => p.name) } },
    select: { id: true, name: true },
  })
  const idByName = new Map(projects.map((p) => [p.name, p.id]))

  await tx.projectMember.createMany({
    data: fakeProjectMembers.map(({ projectName, ...member }) => ({
      ...member,
      projectId: idByName.get(projectName)!,
    })),
    skipDuplicates: true,
  })

  console.log(`projects seeded.`)

  return projects
}
