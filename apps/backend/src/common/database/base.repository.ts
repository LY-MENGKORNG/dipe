import { Injectable } from "@nestjs/common";
import { TransactionHost, type PrismaTx, type TransactionOptions } from "./transaction.host";

@Injectable()
export abstract class BaseRepository {
  constructor(private readonly transactions: TransactionHost) {}

  protected get db(): PrismaTx {
    return this.transactions.client;
  }

  protected transaction<T>(fn: () => Promise<T>, options?: TransactionOptions) {
    return this.transactions.run(fn, options);
  }
}
