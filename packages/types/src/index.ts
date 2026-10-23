export type Mutable<T> = {
	-readonly [P in keyof T]: T[P]
}

export type ObjectEntries<T> =
	T extends ArrayLike<infer U> ? Array<[string, U]> : Array<{ [K in keyof T]: [K, T[K]] }[keyof T]>

import type { User, Post, PostTag, Order, OrderStatus, CustomerOrder } from "../../../apps/backend/src/config/db/generated/browser"

export type PublicUser = Omit<User, "passwordHash">
