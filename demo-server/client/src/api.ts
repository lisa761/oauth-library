const API_URL = "http://localhost:4000"; // Backend server URL

export async function isLoggedIn() {
  const response = await fetch(`${API_URL}/auth/check`, { credentials: "include" });
  const { loggedIn } = await response.json();
  return loggedIn
}

export async function login() {
  const response = await fetch(`${API_URL}/login`, { credentials: "include" });
  const { authUrl } = await response.json();
  window.location.href = authUrl;
}

export async function refreshToken() {
  const response = await fetch(`${API_URL}/refresh`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to refresh tokens");
}

export async function getUserInfo() {
  const response = await fetch(`${API_URL}/user`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to fetch user info");
  return response.json();
}

export async function logout() {
  const response = await fetch(`${API_URL}/logout`, { credentials: "include" });
  const { logoutUrl } = await response.json();
  window.location.href = logoutUrl;
}
