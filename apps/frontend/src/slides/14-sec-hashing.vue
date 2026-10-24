<script lang="ts">
import type { SlideMeta } from "."

export const meta: SlideMeta = {
  title: "Hashing vs encryption",
  section: "Security",
  notes: [
    "Most common confusion of the whole session. Hashing is one-way: you can check a password, never recover it. Encryption is two-way: whoever has the key reads the data.",
    "Passwords → hash. Always. If your DB leaks, attackers should get nothing usable. Our column is literally called password_hash — good.",
    "Live demo on the right: type something. In Hashing mode, change one character and the whole hash changes (avalanche). In Encryption mode, the same input gives a different ciphertext each time (random IV) but decrypts back.",
    "The demo uses SHA-256 only because browsers have it built in. SHA-256 is too FAST for passwords — attackers try billions per second. Use a slow, salted algorithm: argon2id or bcrypt.",
    "Bun ships one: `Bun.password.hash()` defaults to argon2id and embeds the salt in the output. On Node use the `argon2` package.",
    "Encryption is for data you must read back later: a third-party API token you store for a user, PII at rest. Key comes from env/KMS, never from the DB.",
  ],
  ask: "We store users' GitHub tokens so we can call GitHub for them later. Hash or encrypt?",
}
</script>

<script setup lang="ts">
import { Hash, LockKeyhole } from "@lucide/vue"
import { ref, watch } from "vue"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import CodeSnippet from "@/components/deck/CodeSnippet.vue"
import SlideLayout from "@/components/deck/SlideLayout.vue"

const rows = [
  { aspect: "Direction", hash: "One-way", enc: "Two-way (with key)" },
  {
    aspect: "Use for",
    hash: "Passwords",
    enc: "Tokens, PII you must read back",
  },
  {
    aspect: "Algorithm",
    hash: "argon2id / bcrypt (slow + salted)",
    enc: "AES-256-GCM",
  },
  {
    aspect: "If DB leaks",
    hash: "Nothing to recover",
    enc: "Safe while key is safe",
  },
]

const code = `
  // register
  const password_hash = await Bun.password.hash(dto.password);
  // argon2id by default, salt is generated and embedded:
  // → "$argon2id$v=19$m=65536,t=2,p=1$<salt>$<hash>"

  // login
  const ok = await Bun.password.verify(dto.password, user.password_hash);
  if (!ok) throw new UnauthorizedException("Invalid credentials");
`

const mode = ref<"hash" | "encrypt">("hash")
const input = ref("correct horse battery staple")
const output = ref("")
const roundTrip = ref("")

const hex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")
// Web Crypto only exists in secure contexts (https or localhost).
const keyPromise = crypto.subtle?.generateKey(
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"],
)

function setMode(value: unknown) {
  if (value === "hash" || value === "encrypt") mode.value = value
}

watch(
  [mode, input],
  async () => {
    if (!crypto.subtle) {
      output.value =
        "Web Crypto needs https:// or localhost — open the deck on localhost."
      return
    }
    const data = new TextEncoder().encode(input.value)
    if (mode.value === "hash") {
      output.value = hex(await crypto.subtle.digest("SHA-256", data))
      roundTrip.value = ""
      return
    }
    const key = await keyPromise!
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const cipher = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data,
    )
    output.value = hex(cipher)
    roundTrip.value = new TextDecoder().decode(
      await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher),
    )
  },
  { immediate: true },
)
</script>

<template>
  <SlideLayout
    section="Security"
    title="Hashing vs encryption"
    subtitle="Hashing can only be checked. Encryption can be undone — by whoever holds the key."
  >
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Hashing</TableHead>
              <TableHead>Encryption</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in rows" :key="row.aspect">
              <TableCell class="font-medium">
                {{ row.aspect }}
              </TableCell>
              <TableCell>{{ row.hash }}</TableCell>
              <TableCell>{{ row.enc }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <CodeSnippet
          :code="code"
          title="auth.service.ts — Bun.password"
          size="sm"
          :highlight="[2, 7]"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Try it</CardTitle>
          <CardDescription
            >Runs in your browser with Web Crypto. Change one letter and
            watch.</CardDescription
          >
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <ToggleGroup
            :model-value="mode"
            type="single"
            @update:model-value="setMode"
            variant="outline"
            class="w-fit"
          >
            <ToggleGroupItem value="hash">
              <Hash data-icon="inline-start" /> Hash (SHA-256)
            </ToggleGroupItem>
            <ToggleGroupItem value="encrypt">
              <LockKeyhole data-icon="inline-start" /> Encrypt (AES-GCM)
            </ToggleGroupItem>
          </ToggleGroup>
          <Input v-model="input" aria-label="Text to hash or encrypt" />
          <div class="flex flex-col gap-1.5">
            <span class="text-xs font-medium text-muted-foreground"
              >Output</span
            >
            <code class="rounded-md bg-muted p-3 font-mono text-xs break-all">{{
              output
            }}</code>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <template v-if="mode === 'hash'">
              <Badge variant="outline">irreversible</Badge>
              <Badge variant="outline">same input → same hash</Badge>
              <Badge variant="destructive">too fast for passwords</Badge>
            </template>
            <template v-else>
              <Badge variant="outline">random IV → new output each time</Badge>
              <span class="text-muted-foreground">decrypts to:</span>
              <Badge>{{ roundTrip }}</Badge>
            </template>
          </div>
        </CardContent>
      </Card>
    </div>
  </SlideLayout>
</template>
