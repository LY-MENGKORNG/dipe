<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Unit test with mocks",
  section: "Testing",
  notes: [
    "We test UsersService alone. Its dependencies, UserRepository and EmailProducer, are replaced with mock objects via useValue.",
    "Test.createTestingModule builds a tiny DI container — same wiring as production, but we choose the providers.",
    "Arrange / Act / Assert: set up the mock's return value, call the method, check the result AND that the mock was called correctly.",
    "Test the unhappy path too: repository returns null → service throws NotFoundException. That is usually where bugs live.",
    "Tests live in test/, never next to the code: test/unit mirrors src/ and imports through the @modules / @common aliases. Compare with the generated test/unit/modules/auth/auth.middleware.spec.ts, which only checks `toBeDefined()` — a good start, but it asserts nothing about behaviour.",
  ],
}
</script>

<script setup lang="ts">
import { CircleCheck } from "@lucide/vue"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const code = `
  import { beforeEach, describe, expect, it, mock } from "bun:test"
  import { NotFoundException } from "@nestjs/common"
  import { Test } from "@nestjs/testing"
  import { EmailProducer } from "@modules/notifications/email.producer"
  import { UserRepository } from "@modules/users/users.repository"
  import { UsersService } from "@modules/users/users.service"

  describe("UsersService", () => {
    let service: UsersService
    const repository = { findById: mock(), create: mock(), update: mock() }
    const email = { sendWelcome: mock() }

    beforeEach(async () => {
      Object.values(repository).forEach((fn) => fn.mockReset())
      const module = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: UserRepository, useValue: repository },
          { provide: EmailProducer, useValue: email },
        ],
      }).compile()
      service = module.get(UsersService)
    })

    it("returns the user when it exists", async () => {
      repository.findById.mockResolvedValue(user)            // arrange

      const found = await service.findOne(1)                 // act

      expect(found).toEqual(user)                            // assert
      expect(repository.findById).toHaveBeenCalledWith(1)
    })

    it("throws NotFoundException when the user is missing", async () => {
      repository.findById.mockResolvedValue(null)

      const error = await service.findOne(99).catch((e: unknown) => e)

      expect(error).toBeInstanceOf(NotFoundException)
    })
  })
`

const output = `
  $ bun test users.service
  test/unit/modules/users/users.service.spec.ts:
  ✓ UsersService > returns the user when it exists [2.10ms]
  ✓ UsersService > throws NotFoundException when the user is missing [0.41ms]
  ✓ UsersService > hashes the password and never stores it in plain text
  ✓ UsersService > enqueues a welcome email after creating the user
  ✓ UsersService > only rehashes when a new password is sent

   5 pass
   0 fail
  Ran 5 tests across 1 file. [283.00ms]
`
</script>

<template>
  <SlideLayout
    section="Testing"
    title="Unit test with mocks"
    subtitle="Test UsersService alone: the repository is a fake we fully control."
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <CodeSnippet
        :code="code"
        title="test/unit/modules/users/users.service.spec.ts"
        size="sm"
        :highlight="[10, 18, 26, 28, 30, 31, 39]"
      />
      <div class="flex flex-col gap-4">
        <CodeSnippet :code="output" lang="ansi" title="terminal" size="sm" />
        <Alert>
          <CircleCheck />
          <AlertTitle>Rule of thumb</AlertTitle>
          <AlertDescription>
            Mock what you don't own or what is slow (DB, HTTP, queues). Never
            mock the class under test.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </SlideLayout>
</template>
