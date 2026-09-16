/* ===== MOBILE MENU ===== */
let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

if (menu) {
    menu.onclick = () => {
        menu.classList.toggle('bx-x');
        navbar.classList.toggle('active');
    };
}

window.onscroll = () => {
    if (menu && navbar) {
        menu.classList.remove('bx-x');
        navbar.classList.remove('active');
    }
};


/* ===== TYPED TEXT ===== */
if (document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: [
            'Physical Fitness.',
            'Weight Gain',
            'Strength Training',
            'Fat Loss',
            'Weight Lifting',
            'Running'
        ],
        typeSpeed: 60,
        backSpeed: 60,
        backDelay: 1000,
        loop: true
    });
}

function checkLoginStatus(){
  const userId = localStorage.getItem("userId");

  const logoutLink = document.getElementById("logoutLink");
  const loginLink = document.getElementById("loginLink");

  if(userId){
    //  User logged in
    logoutLink.style.display = "block";
    loginLink.style.display = "none";
  }else{
    //  Not logged in
    logoutLink.style.display = "none";
    loginLink.style.display = "block";
  }
}

checkLoginStatus();

function logout(){
  localStorage.clear();   //  clean everything
  window.location.href = "logout.html";
}

function updateAuthUI(){

  const userId = localStorage.getItem("userId");

  const loginLink = document.getElementById("loginLink");
  const adminLink = document.getElementById("adminLink");
  const trainerLink = document.getElementById("trainerLink");
  const logoutLink = document.getElementById("logoutLink");

  if(userId){
    //  Logged In
    loginLink.style.display = "none";
    adminLink.style.display = "none";
    trainerLink.style.display = "none";
    logoutLink.style.display = "block";
  }else{
    //  Logged Out
    loginLink.style.display = "block";
    adminLink.style.display = "block";
    trainerLink.style.display = "block";
    logoutLink.style.display = "none";
  }
}

function logout(){
  localStorage.removeItem("userId");
  localStorage.removeItem("selectedPlanId");
  localStorage.removeItem("selectedPlanName");
  localStorage.removeItem("selectedPrice");

  window.location.href = "home.html";
}

document.addEventListener("DOMContentLoaded", updateAuthUI);

