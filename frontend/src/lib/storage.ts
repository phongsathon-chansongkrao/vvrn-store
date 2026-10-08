/** Small localStorage wrapper. Only the cart is kept in the browser now. */
export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem("vvrn:" + key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem("vvrn:" + key, JSON.stringify(value));
    } catch {
      /* storage full or blocked: ignore */
    }
  },
};
