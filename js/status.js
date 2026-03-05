async function cekStatus(){

const kode = document.getElementById("kodeBooking").value;
const result = document.getElementById("result");

if(!kode){

result.innerHTML = "⚠️ Masukkan kode booking terlebih dahulu";
return;

}

const { data, error } = await supabaseClient
.from("appointments")
.select("*")
.eq("kode_booking", kode)
.single();

if(error){

result.innerHTML = "❌ Booking tidak ditemukan";
return;

}

result.innerHTML = `

<h3>Status Booking</h3>

<p><b>Kode Booking:</b> ${data.kode_booking}</p>
<p><b>Nama:</b> ${data.nama}</p>
<p><b>Tanggal:</b> ${data.tanggal}</p>
<p><b>Hari:</b> ${data.hari}</p>
<p><b>Jam:</b> ${data.jam_mulai} - ${data.jam_selesai}</p>

<p><b>Status:</b> ${data.status}</p>

<p><b>Lokasi / Link:</b> ${data.lokasi ?? "-"}</p>

<p><b>Catatan Admin:</b> ${data.catatan_admin ?? "-"}</p>

`;

}
