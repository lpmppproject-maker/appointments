const form = document.getElementById("loginForm");
const alertBox = document.getElementById("alert");

form.addEventListener("submit", async function(e){

e.preventDefault();

const username = document.getElementById("username").value.trim();
const password = document.getElementById("password").value.trim();

alertBox.innerHTML = "⏳ Memproses login...";

try{

const { data, error } = await supabaseClient
.from("users")
.select("*")
.eq("username", username)
.eq("password", password)
.single();

if(error || !data){

alertBox.innerHTML="❌ Username atau password salah";
return;

}

/* =====================
SIMPAN SESSION
===================== */

const sessionData = {
id: data.id,
username: data.username,
nama: data.nama,
role: data.role,
loginTime: Date.now()
};

localStorage.setItem("userSession", JSON.stringify(sessionData));

alertBox.innerHTML="✅ Login berhasil";

/* =====================
REDIRECT KE ADMIN
===================== */

setTimeout(()=>{
window.location.href="admin.html";
},800);

}catch(err){

alertBox.innerHTML="❌ Terjadi kesalahan saat login";

console.error(err);

}

});
