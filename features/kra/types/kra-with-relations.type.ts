import type { User } from "@/features/user/types";
import type { Kra } from "@/features/kra/types/kra.type";

export type KraParty = Pick<User, "id" | "name" | "email">;

export type KraWithRelations = Kra & {
  assignee: KraParty;
  assigner: KraParty;
};
