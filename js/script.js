const form = document.getElementById("bookingForm");
const alertBox = document.getElementById("alert");

const tanggalInput = document.getElementById("tanggal");
const jamMulaiInput = document.getElementById("jamMulai");
const jamSelesaiInput = document.getElementById("jamSelesai");

const hariList = [
"Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"
];

/* ===============================
SET MIN DATE (tidak bisa pilih tanggal kemarin)
=============================== */

const today = new Date().toISOString().split("T")[0];
tanggalInput.min = today;


/* ===============================
AUTO ISI HARI
=============================== */

tanggalInput.addEventListener("change",function(){

let date = new Date(this.value);
let hari = hariList[date.getDay()];

document.getElementById("hari").value = hari;

});


/* ===============================
AUTO JAM SELESAI (+1 jam)
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
GENERATE KODE BOOKING
=============================== */

function generateKode(){

let rand = Math.floor(Math.random()*1000);

return "APT-"+Date.now()+"-"+rand;

}


/* ===============================
CEK BENTROK JADWAL
=============================== */

async function cekBentrok(tanggal,jamMulai,jamSelesai){

const { data } = await supabaseClient
.from("appointments")
.select("*")
.eq("tanggal",tanggal);

if(!data) return false;

for(let item of data){

if(
(jamMulai < item.jam_selesai && jamSelesai > item.jam_mulai)
){
return true;
}

}

return false;

}


/* ===============================
SUBMIT FORM
=============================== */

form.addEventListener("submit",async function(e){

e.preventDefault();

alertBox.innerHTML = "⏳ Menyimpan data...";

let tanggal = tanggalInput.value;
let hari = document.getElementById("hari").value;
let jamMulai = jamMulaiInput.value;
let jamSelesai = jamSelesaiInput.value;


/* VALIDASI JAM */

if(jamMulai >= jamSelesai){

alertBox.innerHTML="❌ Jam selesai harus lebih besar dari jam mulai";
return;

}


/* CEK BENTROK */

let bentrok = await cekBentrok(tanggal,jamMulai,jamSelesai);

if(bentrok){

alertBox.innerHTML="❌ Jadwal sudah terisi";
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
lokasi:document.getElementById("lokasi").value

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

});
