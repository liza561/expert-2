let locked = false;

export async function withFileLock<T>(fn: () => T): Promise<T> {
  while (locked) {
    await new Promise((r) => setTimeout(r, 10));
  }
  locked = true;
  try {
    return fn();
  } finally {
    locked = false;
  }
}
