import { ModuleMetadata, Type } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

class Factory<T> {
  constructor(
    public instance: Type<T>,
    private readonly metadata: ModuleMetadata,
  ) {}

  async [Symbol.asyncDispose]() {
    console.error("asyncDispose")
    const module: TestingModule = await Test.createTestingModule(
      this.metadata,
    ).compile()

    this.instance = module.get(this.instance)
  }

  [Symbol.dispose]() {
    console.error("dispose")
  }
}

export async function factory<T>(instance: Type<T>, metadata: ModuleMetadata) {
  await using fac = new Factory(instance, metadata)
  return fac
}
