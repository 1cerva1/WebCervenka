requireAuth();

const postsDiv = document.getElementById("posts");
const postForm = document.getElementById("postForm");
const postMessage = document.getElementById("postMessage");
document.getElementById("logoutBtn").addEventListener("click", logout);

function logout() {
  clearToken();
  window.location.href = "index.html";
}

function showPostMessage(text, isError = false) {
  postMessage.textContent = text;
  postMessage.className = `message inline ${isError ? "error" : "success"}`;
}

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await createPost();
});

async function createPost() {
  try {
    await api("/posts", {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({
        title: document.getElementById("title").value.trim(),
        content: document.getElementById("content").value.trim(),
        image: document.getElementById("image").value.trim()
      })
    });

    postForm.reset();
    showPostMessage("Příspěvek byl přidán.");
    await loadPosts();
  } catch (err) {
    showPostMessage(`Nepodařilo se přidat příspěvek: ${err.message}`, true);
  }
}

async function like(postId) {
  try {
    await api(`/posts/${postId}/like`, {
      method: "POST",
      headers: authHeaders()
    });
    await loadPosts();
  } catch (err) {
    alert(`Like se nepovedl: ${err.message}`);
  }
}

async function comment(postId) {
  const input = document.getElementById(`c${postId}`);
  const text = input.value.trim();
  if (!text) return;

  try {
    await api(`/posts/${postId}/comments`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ content: text })
    });
    input.value = "";
    await loadPosts();
  } catch (err) {
    alert(`Komentář se nepovedl: ${err.message}`);
  }
}

async function toggleLikes(postId) {
  const list = document.getElementById(`likes-${postId}`);
  if (!list) return;

  if (list.dataset.loaded !== "true") {
    try {
      const likes = await api(`/posts/${postId}/likes`);
      list.innerHTML = likes.length
        ? likes.map(l => `<div class="mini-row">❤️ <strong>${escapeHtml(l.username)}</strong> · ${escapeHtml(formatDate(l.created_at))}</div>`).join("")
        : '<div class="mini-row">Zatím žádné lajky.</div>';
      list.dataset.loaded = "true";
    } catch (err) {
      list.innerHTML = `<div class="mini-row">Nepodařilo se načíst lajky.</div>`;
    }
  }

  list.classList.toggle("hidden");
}

async function loadPosts() {
  try {
    const posts = await api("/posts");

    if (!Array.isArray(posts) || posts.length === 0) {
      postsDiv.innerHTML = '<article class="card empty-state">Zatím tu nejsou žádné příspěvky.</article>';
      return;
    }

    const commentsByPost = await Promise.all(posts.map(async (post) => {
      try {
        return await api(`/posts/${post.id}/comments`);
      } catch {
        return [];
      }
    }));

    postsDiv.innerHTML = posts.map((post, index) => {
      const comments = commentsByPost[index] || [];
      const postImage = post.image
        ? `<img class="post-image" src="${escapeHtml(post.image)}" alt="Obrázek příspěvku">`
        : "";

      return `
        <article class="card post-card">
          <div class="post-top">
            <div>
              <h2>${escapeHtml(post.title)}</h2>
              <div class="post-meta">${escapeHtml(post.username)} · ${escapeHtml(formatDate(post.created_at))}</div>
            </div>
          </div>
          <p class="post-content">${escapeHtml(post.content)}</p>
          ${postImage}
          <div class="post-toolbar">
            <button type="button" onclick="like(${post.id})">❤️ To se mi líbí</button>
            <button type="button" class="ghost-button dark" onclick="toggleLikes(${post.id})">Počet lajků: ${escapeHtml(post.likes)}</button>
          </div>
          <div id="likes-${post.id}" class="likes-list hidden" data-loaded="false"></div>
          <div class="comment-form">
            <input id="c${post.id}" placeholder="Napiš komentář">
            <button type="button" onclick="comment(${post.id})">Odeslat</button>
          </div>
          <div class="comments-list">
            ${comments.length
              ? comments.map(c => `<div class="comment-item"><strong>${escapeHtml(c.username)}</strong><span>${escapeHtml(c.content)}</span><small>${escapeHtml(formatDate(c.created_at))}</small></div>`).join("")
              : '<div class="comment-empty">Zatím žádné komentáře.</div>'}
          </div>
        </article>
      `;
    }).join("");
  } catch (err) {
    postsDiv.innerHTML = `<article class="card empty-state">Nepodařilo se načíst příspěvky: ${escapeHtml(err.message)}</article>`;
  }
}

loadPosts();
