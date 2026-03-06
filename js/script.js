/* ===============================
LOAD JABATAN DARI SUPABASE
=============================== */

async function loadPositions(){

const { data, error } = await supabaseClient
.from("positions")
.select("*")
.eq("aktif", true)
.order("nama_pejabat");

if(error){
console.error(error);
return;
}

const select = document.getElementById("tujuan_jabatan");

select.innerHTML = '<option value="">Pilih Pejabat</option>';

data.forEach(pos => {

const option = document.createElement("option");

option.value = pos.id;

/* simpan jabatan */
option.dataset.jabatan = pos.nama_jabatan;

option.textContent = pos.nama_pejabat;

select.appendChild(option);

});

}


/* ===============================
ISI JABATAN OTOMATIS
=============================== */

function isiJabatan(){

const select = document.getElementById("tujuan_jabatan");

const option = select.options[select.selectedIndex];

const jabatan = option?.dataset?.jabatan || "";

document.getElementById("nama_jabatan").value = jabatan;

}


/* ===============================
UPDATE GOOGLE CALENDAR
=============================== */

async function updateCalendar(){

const position_id =
document.getElementById("tujuan_jabatan").value;

const calendarFrame =
document.getElementById("calendarFrame");

if(!calendarFrame) return;

if(!position_id){
calendarFrame.src="";
return;
}

const { data, error } = await supabaseClient
.from("positions")
.select("calendar_id")
.eq("id", position_id)
.single();

if(error){
console.error("Error load calendar:", error);
return;
}

if(!data?.calendar_id){
calendarFrame.src="";
return;
}

calendarFrame.src =
"https://calendar.google.com/calendar/embed?src="
+ encodeURIComponent(data.calendar_id)
+ "&ctz=Asia/Jakarta";

}


/* ===============================
ELEMENT
=============================== */

const form = document.getElementById("bookingForm");
const alertBox = document.getElementById("alert");

const tanggalInput = document.getElementById("tanggal");
const jamMulaiInput = document.getElementById("jamMulai");
const jamSelesaiInput = document.getElementById("jamSelesai");

const hariList = [
"Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"
];


/* ===============================
INIT PAGE
=============================== */

document.addEventListener("DOMContentLoaded", async () => {

await loadPositions();

updateCalendar();

});


/* ===============================
SET MIN DATE
=============================== */

const today = new Date().toISOString().split("T")[0];
tanggalInput.min = today;


/* ===============================
AUTO HARI
=============================== */

tanggalInput.addEventListener("change",function(){

let date = new Date(this.value);
let hari = hariList[date.getDay()];

document.getElementById("hari").value = hari;

updateSlotAvailability();

});


/* ===============================
AUTO JAM SELESAI
=============================== */

jamMulaiInput.addEventListener("change",function(){

let jam = this.value.split(":")[0];
let nextJam = parseInt(jam) + 1;

if(nextJam < 10){
nextJam = "0" + nextJam;
}

jamSelesaiInput.value = nextJam + ":00";

});


/* ===============================
GENERATE BOOKING CODE
=============================== */

function generateKode(){

let rand = Math.floor(Math.random()*1000);

return "APT-"+Date.now()+"-"+rand;

}


/* ===============================
CEK BENTROK PER PEJABAT
=============================== */

async function cekBentrok(tanggal,jamMulai,jamSelesai,position_id){

const { data } = await supabaseClient
.from("appointments")
.select("*")
.eq("tanggal",tanggal)
.eq("position_id",position_id);

if(!data) return false;

for(let item of data){

if(
(jamMulai < item.jam_selesai &&
 jamSelesai > item.jam_mulai)
){
return true;
}

}

return false;

}


/* ===============================
SUBMIT BOOKING
=============================== */

form.addEventListener("submit",async function(e){

e.preventDefault();

alertBox.innerHTML = "⏳ Menyimpan data...";

let tanggal = tanggalInput.value;
let hari = document.getElementById("hari").value;
let jamMulai = jamMulaiInput.value;
let jamSelesai = jamSelesaiInput.value;

let position_id =
document.getElementById("tujuan_jabatan").value;


/* VALIDASI JAM */

if(jamMulai >= jamSelesai){

alertBox.innerHTML=
"❌ Jam selesai harus lebih besar dari jam mulai";

return;

}


/* VALIDASI JABATAN */

if(!position_id){

alertBox.innerHTML=
"❌ Pilih tujuan pejabat terlebih dahulu";

return;

}


/* CEK BENTROK */

let bentrok = await cekBentrok(
tanggal,
jamMulai,
jamSelesai,
position_id
);

if(bentrok){

alertBox.innerHTML=
"❌ Jadwal pejabat sudah terisi";

return;

}


/* GENERATE BOOKING */

let kodeBooking = generateKode();

let booking = {

kode_booking:kodeBooking,
tanggal:tanggal,
hari:hari,
jam_mulai:jamMulai,
jam_selesai:jamSelesai,

nama:document.getElementById("nama").value,
nim:document.getElementById("nim").value,
prodi:document.getElementById("prodi").value,
email:document.getElementById("email").value,
no_hp:document.getElementById("hp").value,

keperluan:document.getElementById("keperluan").value,
mode:document.getElementById("mode").value,
lokasi:document.getElementById("lokasi").value,

position_id:position_id

};


/* INSERT DATA */

const { error } = await supabaseClient
.from("appointments")
.insert([booking]);

if(error){

alertBox.innerHTML="❌ Gagal menyimpan data";

return;

}


/* SUCCESS */

alertBox.innerHTML = `
✅ Appointment berhasil dibuat <br><br>
<b>Kode Booking:</b> ${kodeBooking}
`;

form.reset();

updateSlotAvailability();

});


/* ===============================
UPDATE SLOT
=============================== */

async function updateSlotAvailability(){

let tanggal =
document.getElementById("tanggal").value;

let position_id =
document.getElementById("tujuan_jabatan").value;

if(!tanggal || !position_id) return;

const { data } = await supabaseClient
.from("appointments")
.select("*")
.eq("tanggal",tanggal)
.eq("position_id",position_id);

slots.forEach(btn =>
btn.classList.remove("disabled")
);

data.forEach(item=>{

slots.forEach(btn=>{

if(btn.dataset.time === item.jam_mulai){
btn.classList.add("disabled");
}

});

});

}


/* ===============================
SLOT WAKTU
=============================== */

const slots = document.querySelectorAll(".slot-btn");

slots.forEach(btn => {

btn.addEventListener("click",function(){

if(this.classList.contains("disabled")) return;

slots.forEach(b=>{
b.classList.remove("selected");
});

this.classList.add("selected");

document.getElementById("jamMulai").value =
this.dataset.time;

let jam =
parseInt(this.dataset.time.split(":")[0]) + 1;

document.getElementById("jamSelesai").value =
(jam < 10 ? "0"+jam : jam) + ":00";

});

});


/* ===============================
CHANGE PEJABAT
=============================== */

document
.getElementById("tujuan_jabatan")
.addEventListener("change",function(){

slots.forEach(b=>{
b.classList.remove("selected");
b.classList.remove("disabled");
});

isiJabatan();
updateSlotAvailability();
updateCalendar();

});
