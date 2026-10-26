import { describe, expect, it } from "bun:test"
import { as, useE2E } from "./app"

describe("Email queue (e2e)", () => {
  const t = useE2E("queue")

  it("processes a welcome email job when a user is created", async () => {
    const email = `queue-${t.suffix}@dipe.dev`
    const created = await t.app.inject({
      method: "POST",
      url: "/api/users",
      headers: as(t.admin),
      payload: { name: "Queue User", email, password: "Password1" },
    })
    expect(created.statusCode).toBe(201)
    t.createdIds.push(created.json<{ id: number }>().id)

    type Overview = { recent: { state: string; data: { email: string } }[] }
    let job: Overview["recent"][number] | undefined

    for (let i = 0; i < 40 && job?.state !== "completed"; i++) {
      await Bun.sleep(100)
      const res = await t.app.inject({
        method: "GET",
        url: "/api/jobs/email",
        headers: as(t.admin),
      })
      job = res.json<Overview>().recent.find((j) => j.data.email === email)
    }

    expect(job?.state).toBe("completed")
    expect(t.mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        template: "welcome",
        context: { name: "Queue User", email },
      }),
    )
  })

  it("hides the jobs dashboard from employees", async () => {
    const res = await t.app.inject({
      method: "GET",
      url: "/api/jobs/email",
      headers: as(t.employee),
    })
    expect(res.statusCode).toBe(403)
  })
})
