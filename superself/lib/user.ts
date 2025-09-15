export type UserProfile = {
  name?: string;
  email?: string;
  avatarUrl?: string;
  timezone?: string;
};

const USER_KEY = "user_profile";
export const PROFILE_UPDATED_EVENT = "profile:updated";

export function loadUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveUserProfile(p: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}