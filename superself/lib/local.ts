const INTAKE_KEY = "challenge:intake";
const STATE_KEY = "challenge:state";

export function saveIntake(intake: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INTAKE_KEY, JSON.stringify(intake));
}
export function loadIntake<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(INTAKE_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function saveState(state: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}
export function loadState<T = any>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STATE_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}
