import "server-only";

/**
 * The object store, for everything that runs inside the application.
 *
 * A re-export rather than the implementation, because the field import script runs outside
 * Next and cannot import a module marked server-only. Application code imports this one so
 * the guard still catches an accidental import from a client component.
 */
export * from "@/lib/storage/r2";
