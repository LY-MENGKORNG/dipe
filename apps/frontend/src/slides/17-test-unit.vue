<script lang="ts">
import type { SlideMeta } from '.'

export const meta: SlideMeta = {
  title: 'Unit test with mocks',
  section: 'Testing',
  notes: [
    'We test UsersService alone. Its only dependency, UserRepository, is replaced with a mock object via useValue.',
    'Test.createTestingModule builds a tiny DI container — same wiring as production, but we choose the providers.',
    'Arrange / Act / Assert: set up the mock\'s return value, call the method, check the result AND that the mock was called correctly.',
    'Test the unhappy path too: repository returns null → service throws NotFoundException. That is usually where bugs live.',
    'Compare with the generated spec files in the repo (users.guard.spec.ts) which only check `toBeDefined()` — a good start, but they assert nothing about behaviour.',
  ],
}
</script>

<script setup lang="ts">
import { CircleCheck } from '@lucide/vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import CodeSnippet from '@/components/deck/CodeSnippet.vue'
import SlideLayout from '@/components/deck/SlideLayout.vue'

const code = `
  import { beforeEach, describe, expect, it, mock } from "bun:test";
  import { Test } from "@nestjs/testing";
  import { NotFoundException } from "@nestjs/common";

  describe("UsersService", () => {
    let service: UsersService;
    const repository = { findMany: mock(), findOne: mock() };

    beforeEach(async () => {
      repository.findOne.mockReset();
      const module = await Test.createTestingModule({
        providers: [UsersService, { provide: UserRepository, useValue: repository }],
      }).compile();
      service = module.get(UsersService);
    });

    it("returns the user when it exists", async () => {
      repository.findOne.mockResolvedValue({ id: 1, name: "Dara" });   // arrange

      const user = await service.findOne(1);                           // act

      expect(user).toEqual({ id: 1, name: "Dara" });                   // assert
      expect(repository.findOne).toHaveBeenCalledWith(1);
    });

    it("throws 404 when the user is missing", async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });
`

const output = `
  $ bun test users.service
  users.service.spec.ts:
  ✓ UsersService > returns the user when it exists [2.10ms]
  ✓ UsersService > throws 404 when the user is missing [0.41ms]

   2 pass
   0 fail
  Ran 2 tests across 1 file. [118.00ms]
`
</script>

<template>
  <SlideLayout
    section="Testing"
    title="Unit test with mocks"
    subtitle="Test UsersService alone: the repository is a fake we fully control."
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <CodeSnippet :code="code" title="src/modules/users/users.service.spec.ts" size="sm" :highlight="[7, 12, 18, 22, 23, 28]" />
      <div class="flex flex-col gap-4">
        <CodeSnippet :code="output" lang="ansi" title="terminal" size="sm" />
        <Alert>
          <CircleCheck />
          <AlertTitle>Rule of thumb</AlertTitle>
          <AlertDescription>
            Mock what you don't own or what is slow (DB, HTTP, queues). Never mock the class under test.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </SlideLayout>
</template>
