document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("message");

  if (!form) {
    console.error("loginForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    message.innerHTML = "";
    message.style.color = "red";

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok || !data.success) {
        message.innerHTML = data.message || "Login failed";
        return;
      }

      // save login data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      message.style.color = "green";
      message.innerHTML = "Login successful, redirecting...";

      // hard redirect to dashboard
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 300);

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      message.innerHTML = "Server error. Please try again.";
    }
  });
});