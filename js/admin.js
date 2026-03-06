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

/* =====================
Logout
===================== */

function logout(){

localStorage.removeItem("userSession");
window.location.href = "login.html";

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

<td>
<input type="checkbox"
class="selectRow"
value="${item.id}">
</td>

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

<div class="actions">

<button class="btn btn-approve"
onclick="approve('${item.id}')">
Approve
</button>

<button class="btn btn-reject"
onclick="reject('${item.id}')">
Reject
</button>

<button class="btn btn-delete"
onclick="deleteBooking('${item.id}')">
Delete
</button>

</div>

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

const { data, error } = await supabaseClient
.from("appointments")
.select("*")
.eq("id",id)
.single();

if(error || !data){

alert("Data appointment tidak ditemukan");
return;

}

/* UPDATE DATABASE */

await supabaseClient
.from("appointments")
.update({
status:"Disetujui",
lokasi:lokasi,
catatan_admin:catatan,
disetujui_oleh:"Admin"
})
.eq("id",id);

/* KIRIM KE GOOGLE CALENDAR */

try{
console.log("Mengirim data ke Google Calendar:", data);
  
await fetch("https://script.google.com/macros/s/AKfycbzoZW5XvCFXO33zjRPg74DJzkJ_dbxO8pIgnGse090J36oJV6FltXbGqFT_YiQ5I9bf/exec",{

method:"POST",

headers:{
"Content-Type":"application/x-www-form-urlencoded"
},

body:new URLSearchParams({

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
  
console.log("Webhook berhasil dikirim");

}catch(err){

console.error("Webhook gagal:",err);
}

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

document.addEventListener("DOMContentLoaded", function(){

loadBooking();

});

/* ========== Select===============*/
document
.getElementById("selectAll")
.addEventListener("change",function(){

const rows =
document.querySelectorAll(".selectRow");

rows.forEach(cb=>{
cb.checked = this.checked;
});

});

/* ========== Delete ===============*/
async function bulkDelete(){

const checked =
document.querySelectorAll(".selectRow:checked");

if(checked.length === 0){
alert("Pilih data yang ingin dihapus");
return;
}

if(!confirm("Hapus semua booking yang dipilih?"))
return;

let ids = [];

checked.forEach(cb=>{
ids.push(cb.value);
});

const { error } = await supabaseClient
.from("appointments")
.delete()
.in("id", ids);

if(error){
alert("Gagal menghapus");
return;
}

loadBooking();

}

/* ========== Single Delete ===============*/
async function deleteBooking(id){

if(!confirm("Hapus booking ini?")) return;

const { error } = await supabaseClient
.from("appointments")
.delete()
.eq("id",id);

if(error){
alert("Gagal hapus");
return;
}

loadBooking();

}
