const API_BASE = "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token") || "";
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function authHeaders(withJson = false) {
  const headers = {};
  const token = getToken();
  if (withJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = token;
  return headers;
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof payload === "string" ? payload : payload?.msg || payload?.message || JSON.stringify(payload);
    throw new Error(message || `HTTP ${res.status}`);
  }

  return payload;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("cs-CZ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}
