export function reportLovableError(error: unknown, meta?: Record<string, unknown>) {
  console.error("[ErrorReport]", error, meta);
}
