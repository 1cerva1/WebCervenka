const userBox = document.getElementById("user");
const id = new URLSearchParams(window.location.search).get("id");
const logoutBtn2 = document.getElementById("logoutBtn");
if (logoutBtn2) logoutBtn2.addEventListener("click", () => {
  clearToken();
  window.location.href = "index.html";
});

async function loadUser() {
  try {
    const data = await api(`/users/${id}`);

    if (!data?.user) {
      userBox.innerHTML = '<article class="card empty-state">Uživatel nebyl nalezen.</article>';
      return;
    }

    const posts = Array.isArray(data.posts) ? data.posts : [];

    userBox.innerHTML = `
      <section class="card user-hero">
        <div class="avatar-badge large">${escapeHtml((data.user.first_name?.[0] || "U") + (data.user.last_name?.[0] || ""))}</div>
        <div>
          <h1>${escapeHtml(data.user.first_name)} ${escapeHtml(data.user.last_name)}</h1>
          <p>Věk: ${escapeHtml(data.user.age ?? "—")} · Pohlaví: ${escapeHtml(data.user.gender ?? "—")}</p>
          <p>Uživatelské jméno: ${escapeHtml(data.user.username ?? "—")}</p>
        </div>
      </section>

      <section class="section-head">
        <h2>Příspěvky uživatele</h2>
      </section>

      <section class="posts-list">
        ${posts.length ? posts.map(p => `
          <article class="card post-card compact">
            <h3>${escapeHtml(p.title)}</h3>
            <div class="post-meta">${escapeHtml(formatDate(p.created_at))}</div>
            <p class="post-content">${escapeHtml(p.content)}</p>
            ${p.image ? `<img class="post-image" src="${escapeHtml(p.image)}" alt="Obrázek příspěvku">` : ""}
          </article>
        `).join("") : '<article class="card empty-state">Uživatel zatím nemá žádné příspěvky.</article>'}
      </section>
    `;
  } catch (err) {
    userBox.innerHTML = `<article class="card empty-state">Nepodařilo se načíst detail uživatele: ${escapeHtml(err.message)}</article>`;
  }
}

loadUser();
