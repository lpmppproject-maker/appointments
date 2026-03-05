const form = document.getElementById("loginForm");
const alertBox = document.getElementById("alert");

form.addEventListener("submit", async function(e){

e.preventDefault();

let username = document.getElementById("username").value;
let password = document.getElementById("password").value;

const { data, error } = await supabaseClient
.from("users")
.select("*")
.eq("username",username)
.eq("password",password)
.single();

if(error || !data){

alertBox.innerHTML="❌ Username atau password salah";
return;

}

/* SIMPAN SESSION */

localStorage.setItem("user", JSON.stringify(data));

alertBox.innerHTML="✅ Login berhasil";

setTimeout(()=>{
window.location.href="admin.html";
},1000);

});
