/* =====================
CHECK LOGIN SESSION
===================== */

const session = localStorage.getItem("userSession");

if(!session){

window.location.href = "login.html";

}else{

const user = JSON.parse(session);

console.log("Login sebagai:", user.username);

}

const table = document.getElementById("dataBooking");
const filter = document.getElementById("filterStatus");
const search = document.getElementById("searchInput");

const totalBooking = document.getElementById("totalBooking");
const totalMenunggu = document.getElementById("totalMenunggu");
const totalSetuju = document.getElementById("totalSetuju");
const totalTolak = document.getElementById("totalTolak");

async function loadBooking(){

let statusFilter = filter.value;
let keyword = search.value.toLowerCase();

const { data, error } = await supabaseClient
.from("appointments")
.select("*")
.order("timestamp",{ascending:false});

if(error){

alert("Gagal mengambil data");
return;

}
  
function logout(){

localStorage.removeItem("userSession");

window.location.href = "login.html";

}

/* ===================
STATISTIK
=================== */

totalBooking.innerText = data.length;

totalMenunggu.innerText = data.filter(
d=>d.status==="Menunggu"
).length;

totalSetuju.innerText = data.filter(
d=>d.status==="Disetujui"
).length;

totalTolak.innerText = data.filter(
d=>d.status==="Ditolak"
).length;

/* ===================
FILTER DATA
=================== */

let filtered = data.filter(item=>{

let cocokSearch =
item.nama?.toLowerCase().includes(keyword) ||
item.nim?.toLowerCase().includes(keyword) ||
item.kode_booking?.toLowerCase().includes(keyword);

let cocokStatus =
statusFilter==="Semua" ||
item.status===statusFilter;

return cocokSearch && cocokStatus;

});

/* ===================
RENDER TABLE
=================== */

table.innerHTML="";

filtered.forEach(item => {

let badge = "";

if(item.status==="Menunggu"){
badge = '<span class="badge badge-menunggu">Menunggu</span>';
}

if(item.status==="Disetujui"){
badge = '<span class="badge badge-setuju">Disetujui</span>';
}

if(item.status==="Ditolak"){
badge = '<span class="badge badge-tolak">Ditolak</span>';
}

let row = `

<tr>

<td>${item.kode_booking}</td>

<td>${item.nama}</td>

<td>${item.nim ?? "-"}</td>

<td>${item.prodi ?? "-"}</td>

<td>${item.tanggal}</td>

<td>${item.jam_mulai} - ${item.jam_selesai}</td>

<td>${item.mode}</td>

<td>${item.keperluan}</td>

<td>${badge}</td>

<td>

<button onclick="approve('${item.id}')">Approve</button> <button onclick="reject('${item.id}')">Reject</button>

</td>

</tr>
`;

table.innerHTML += row;

});

}

/* ===================
APPROVE
=================== */

async function approve(id){

let lokasi = prompt("Masukkan lokasi meeting");
let catatan = prompt("Catatan admin");

const { data } = await supabaseClient
.from("appointments")
.select("*")
.eq("id",id)
.single();

await supabaseClient
.from("appointments")
.update({
status:"Disetujui",
lokasi:lokasi,
catatan_admin:catatan,
disetujui_oleh:"Admin"
})
.eq("id",id);

/* WEBHOOK GOOGLE */

fetch("https://script.google.com/macros/s/AKfycbxazzNI7MB74Vq-2SOEFoQQUHA0I2dPq0pdvkymlBXQO99FNCVUzUb48wrXtHMpqgrWiA/exec",{

method:"POST",

mode:"no-cors",

body:stringify({

kode_booking:data.kode_booking,
nama:data.nama,
nim:data.nim,
prodi:data.prodi,
email:data.email,
no_hp:data.no_hp,

tanggal:data.tanggal,
jam_mulai:data.jam_mulai,
jam_selesai:data.jam_selesai,

keperluan:data.keperluan,
lokasi:lokasi

})

});

loadBooking();

}

/* ===================
REJECT
=================== */

async function reject(id){

let catatan = prompt("Alasan penolakan");

await supabaseClient
.from("appointments")
.update({

status:"Ditolak",
catatan_admin:catatan

})
.eq("id",id);

loadBooking();

}

loadBooking();
