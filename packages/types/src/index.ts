import { User as PrivateUser } from "../../../apps/backend/src/config/db/generated/browser"

export type {
  Currency,
  Language,
  Role,
  Workspace,
  WorkspaceVisibility,
  WorkspaceMember,
} from "../../../apps/backend/src/config/db/generated/browser"

export { $Enums } from "../../../apps/backend/src/config/db/generated/browser"

export type User = Omit<PrivateUser, "passwordHash">

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type ObjectEntries<T> =
  T extends ArrayLike<infer U>
    ? Array<[string, U]>
    : Array<{ [K in keyof T]: [K, T[K]] }[keyof T]>
