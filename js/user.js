const userInfo = document.querySelector("#user_info");
const userD = document.querySelector("#user");
const links = document.querySelector("#links");
const name = sessionStorage.getItem("username") || localStorage.getItem("username");

if (name) {
  if (links) links.style.display = "none";
  if (userInfo) userInfo.style.display = "flex";
  if (userD) userD.textContent = name;
} else {
  if (links) links.style.display = "";
  if (userInfo) userInfo.style.display = "none";
}

const logOutBtn = document.querySelector("#logout");
if (logOutBtn) {
  logOutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("username");
    sessionStorage.removeItem("username");
    window.location.href = "login.html";
  });
}

