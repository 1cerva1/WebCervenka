const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const messageBox = document.getElementById("message");

if (getToken()) {
  window.location.href = "feed.html";
}

function showMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.className = `message ${isError ? "error" : "success"}`;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const data = await api("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value
      })
    });

    setToken(data.token);
    window.location.href = "feed.html";
  } catch (err) {
    showMessage(`Přihlášení se nepovedlo: ${err.message}`, true);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const age = Number(document.getElementById("r_age").value);
  if (age < 13) {
    showMessage("Uživatel musí mít alespoň 13 let.", true);
    return;
  }

  try {
    await api("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: document.getElementById("r_first").value.trim(),
        last_name: document.getElementById("r_last").value.trim(),
        age,
        gender: document.getElementById("r_gender").value.trim(),
        username: document.getElementById("r_user").value.trim(),
        password: document.getElementById("r_pass").value
      })
    });

    registerForm.reset();
    showMessage("Registrace proběhla úspěšně. Teď se můžeš přihlásit.");
  } catch (err) {
    showMessage(`Registrace se nepovedla: ${err.message}`, true);
  }
});
