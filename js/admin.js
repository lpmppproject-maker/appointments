async function checkAuth(){

const { data } = await supabaseClient.auth.getUser();

if(!data.user){

window.location.href="login.html";

}

}

checkAuth();

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

await supabaseClient
.from("appointments")
.update({

status:"Disetujui",
lokasi:lokasi,
catatan_admin:catatan,
disetujui_oleh:"Admin"

})
.eq("id",id);

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
