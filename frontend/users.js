const usersDiv = document.getElementById("users");
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => {
  clearToken();
  window.location.href = "index.html";
});

async function loadUsers() {
  try {
    const users = await api("/users");

    if (!Array.isArray(users) || users.length === 0) {
      usersDiv.innerHTML = '<article class="card empty-state">Žádní uživatelé zatím nejsou k dispozici.</article>';
      return;
    }

    usersDiv.innerHTML = users.map(u => `
      <a class="user-card card" href="user.html?id=${u.id}">
        <div class="avatar-badge">${escapeHtml((u.first_name?.[0] || "U") + (u.last_name?.[0] || ""))}</div>
        <div>
          <h2>${escapeHtml(u.first_name)} ${escapeHtml(u.last_name)}</h2>
          <p>@${escapeHtml((u.first_name + u.last_name).toLowerCase())}</p>
        </div>
      </a>
    `).join("");
  } catch (err) {
    usersDiv.innerHTML = `<article class="card empty-state">Nepodařilo se načíst uživatele: ${escapeHtml(err.message)}</article>`;
  }
}

loadUsers();
