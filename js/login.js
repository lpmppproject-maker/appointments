const form = document.getElementById("loginForm");
const alertBox = document.getElementById("alert");

form.addEventListener("submit", async function(e){

e.preventDefault();

let email = document.getElementById("email").value;
let password = document.getElementById("password").value;

const { data, error } = await supabaseClient.auth.signInWithPassword({

email: email,
password: password

});

if(error){

alertBox.innerHTML="❌ Login gagal";
return;

}

alertBox.innerHTML="✅ Login berhasil";

window.location.href = "admin.html";

});
