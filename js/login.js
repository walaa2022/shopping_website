document.addEventListener("DOMContentLoaded", () => {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const signIn   = document.getElementById("sign_in");
  const remember = document.getElementById("remember_me");

  if (!signIn) return;

  signIn.addEventListener("click", (e) => {
    e.preventDefault();
    const u = username?.value.trim();
    if (!u) return alert("Enter a username");

    // (Optional) validate against stored users here

    // Remember me → localStorage; otherwise sessionStorage
    if (remember && remember.checked) {
      localStorage.setItem("username", u);
      sessionStorage.removeItem("username");
    } else {
      sessionStorage.setItem("username", u);
      localStorage.removeItem("username");
    }
    window.location.href = "index.html";
  });
});



