document.addEventListener("DOMContentLoaded", () => {
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const signUp = document.getElementById("sign_up");

  if (!signUp) return;

  signUp.addEventListener("click", (e) => {
    e.preventDefault();

    const u = username?.value.trim();
    const em = email?.value.trim();
    const pw = password?.value.trim();

    // Simple validation
    if (!u || !em || !pw) {
      alert("Please fill in all fields before registering.");
      return;
    }

    // Save user record (basic mock storage)
    const userData = { username: u, email: em, password: pw };
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("username", u);
    sessionStorage.removeItem("username");

    // Toast popup message
    const toast = document.getElementById("toast");
    if (toast) {
      toast.style.display = "block";
      toast.textContent = "Account created successfully!";
      setTimeout(() => {
        toast.style.display = "none";
        window.location.href = "login.html";
      }, 1500);
    } else {
      alert("Account created successfully!");
      window.location.href = "login.html";
    }
  });
});
