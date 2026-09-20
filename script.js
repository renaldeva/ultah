// ===== PENGATURAN =====

// 1. Kode rahasia (4 angka). Contoh di bawah = 23 September -> "2309".
//    Ganti kalau tanggal atau bulannya beda, atau pakai kode lain yang cuma kalian berdua tahu.
const kodeRahasia = "2309";

// 2. Tanggal kalian ketemu lagi. Format: "tahun-bulan-tanggal".
//    Kalau belum ada rencana, kosongkan: const meetDate = "";

// 3. Halaman baru bisa dibuka pada waktu ini (sebelum itu muncul hitung mundur).
//    Format: "tahun-bulan-tanggalTjam:menit:detik+zona"
//    Zona waktu: +07:00 = WIB, +08:00 = WITA, +09:00 = WIT.
//    Kosongkan ("") kalau mau halaman langsung bisa dibuka kapan saja.
// const waktuBuka = "2026-09-23T00:00:00+07:00";
const waktuBuka = "2026-09-20T23:58:00+07:00";
const meetDate = "";


// ===== Bagian di bawah ini tidak perlu diubah =====

// Menandai bahwa JavaScript aktif (dipakai CSS untuk efek muncul saat scroll)
document.documentElement.classList.add("js");

const gate = document.getElementById("gate");
const codeBox = document.getElementById("code");
const inputs = codeBox.querySelectorAll("input");
const gateError = document.getElementById("gateError");
const unlockBtn = document.getElementById("unlockBtn");
const musik = document.getElementById("musik");
const musicBtn = document.getElementById("musicBtn");


// ----- Kode rahasia -----
inputs.forEach(function (input, i) {
  // Hanya angka, lalu pindah ke kotak berikutnya
  input.addEventListener("input", function () {
    input.value = input.value.replace(/\D/g, "");
    if (input.value !== "" && i < inputs.length - 1) {
      inputs[i + 1].focus();
    }
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && input.value === "" && i > 0) {
      inputs[i - 1].focus();
    }
    if (e.key === "Enter") {
      cekKode();
    }
  });
});

// Kalau kode ditempel (paste) sekaligus
inputs[0].addEventListener("paste", function (e) {
  const teks = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
  if (teks !== "") {
    e.preventDefault();
    inputs.forEach(function (input, i) {
      input.value = teks[i] || "";
    });
  }
});

function cekKode() {
  let kode = "";
  inputs.forEach(function (input) {
    kode += input.value;
  });

  if (kode === kodeRahasia) {
    bukaHalaman();
  } else {
    gateError.hidden = false;
    // Ulangi animasi getar
    codeBox.classList.remove("shake");
    void codeBox.offsetWidth;
    codeBox.classList.add("shake");
  }
}

unlockBtn.addEventListener("click", cekKode);

function bukaHalaman() {
  // Lagu mulai di sini karena browser baru mengizinkan setelah ada klik
  musik.volume = 0.6;
  musik.play().catch(function () {
    // Kalau lagu.mp3 tidak ada, halaman tetap jalan tanpa musik
  });

  gate.classList.add("hide");
  document.body.classList.remove("locked");
  musicBtn.hidden = false;

  setTimeout(function () {
    gate.hidden = true;
  }, 900);
}


// ----- Kunci waktu: halaman baru bisa dibuka pada waktuBuka -----
const waiting = document.getElementById("waiting");
const waitInfo = document.getElementById("waitInfo");
const waitCountdown = document.getElementById("waitCountdown");

function tampilkanGerbang() {
  gate.hidden = false;
  inputs[0].focus();
}

function dua(n) {
  return n < 10 ? "0" + n : "" + n;
}

const targetBuka = waktuBuka !== "" ? new Date(waktuBuka) : null;
const kunciAktif = targetBuka !== null && !isNaN(targetBuka) && Date.now() < targetBuka.getTime();

if (kunciAktif) {
  gate.hidden = true;
  waiting.hidden = false;

  waitInfo.textContent =
    "Ada sesuatu yang baru bisa dibuka pada " +
    targetBuka.toLocaleString("id-ID", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) +
    ". Kembali lagi ya.";

  let timer = null;

  function perbaruiHitungMundur() {
    const sisa = Math.floor((targetBuka.getTime() - Date.now()) / 1000);

    if (sisa <= 0) {
      // Sudah waktunya: layar tunggu hilang, layar kode rahasia muncul
      clearInterval(timer);
      waiting.classList.add("hide");
      setTimeout(function () {
        waiting.hidden = true;
        tampilkanGerbang();
      }, 900);
      return;
    }

    const hari = Math.floor(sisa / 86400);
    const jam = Math.floor((sisa % 86400) / 3600);
    const menit = Math.floor((sisa % 3600) / 60);
    const detik = sisa % 60;

    waitCountdown.textContent =
      (hari > 0 ? hari + " hari " : "") + dua(jam) + ":" + dua(menit) + ":" + dua(detik);
  }

  perbaruiHitungMundur();
  timer = setInterval(perbaruiHitungMundur, 1000);
} else {
  tampilkanGerbang();
}


// ----- Tombol musik nyala/mati -----
musicBtn.addEventListener("click", function () {
  if (musik.paused) {
    musik.play();
    musicBtn.textContent = "Musik: nyala";
  } else {
    musik.pause();
    musicBtn.textContent = "Musik: mati";
  }
});


// ----- Yang diperbarui saat halaman di-scroll -----
// 1) garis kemajuan, 2) menu yang aktif, 3) isi bagian yang muncul pelan
const progressFill = document.getElementById("progressFill");
const navLinks = document.querySelectorAll(".links a");
const sections = document.querySelectorAll("main section");
const reveals = document.querySelectorAll(".reveal");
let menuTerakhir = "";

function perbaruiHalaman() {
  // 1. Garis kemajuan
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const persen = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressFill.style.height = persen + "%";

  // 2. Menu aktif = bagian terakhir yang sudah lewat 30% tinggi layar
  let aktifId = sections[0].id;
  sections.forEach(function (s) {
    if (s.getBoundingClientRect().top <= window.innerHeight * 0.3) {
      aktifId = s.id;
    }
  });
  // Kalau sudah mentok di bawah, bagian terakhir yang aktif
  if (max > 0 && window.scrollY >= max - 2) {
    aktifId = sections[sections.length - 1].id;
  }

  if (aktifId !== menuTerakhir) {
    menuTerakhir = aktifId;
    navLinks.forEach(function (a) {
      const aktif = a.getAttribute("href") === "#" + aktifId;
      a.classList.toggle("active", aktif);

      // Geser menu supaya yang aktif selalu kelihatan di layar HP
      if (aktif) {
        const kotak = a.parentElement;
        kotak.scrollTo({
          left: a.offsetLeft - kotak.clientWidth / 2 + a.clientWidth / 2,
          behavior: "smooth",
        });
      }
    });
  }

  // 3. Isi bagian muncul kalau sudah masuk layar (atau sudah terlewat)
  reveals.forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.classList.add("in");
    }
  });
}

window.addEventListener("scroll", perbaruiHalaman);
window.addEventListener("resize", perbaruiHalaman);
perbaruiHalaman();


// ----- Galeri: ketuk foto untuk memperbesar -----
const photos = document.querySelectorAll(".photo");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

photos.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const img = btn.querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = btn.querySelector("span").textContent;
    lightbox.hidden = false;
    document.body.classList.add("locked");
    lightboxClose.focus();
  });
});

function tutupLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("locked");
}

lightbox.addEventListener("click", function (e) {
  // Klik di luar foto = tutup
  if (e.target !== lightboxImg) {
    tutupLightbox();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !lightbox.hidden) {
    tutupLightbox();
  }
});


// ----- Surat -----
const openBtn = document.getElementById("openLetter");
const letter = document.getElementById("letter");

openBtn.addEventListener("click", function () {
  openBtn.hidden = true;
  letter.hidden = false;

  // Tiap paragraf muncul dengan jeda 0.9 detik dari yang sebelumnya
  const paragraphs = letter.querySelectorAll("p");
  paragraphs.forEach(function (p, i) {
    p.style.animationDelay = i * 0.9 + "s";
  });

  letter.classList.add("show");

  letter.setAttribute("tabindex", "-1");
  letter.focus({ preventScroll: true });
});


// ----- Hitung mundur sampai ketemu -----
const countdownText = document.getElementById("countdownText");

if (meetDate !== "") {
  const target = new Date(meetDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (days > 0) {
    countdownText.textContent = "Tinggal " + days + " hari lagi sampai kita ketemu.";
    countdownText.hidden = false;
  } else if (days === 0) {
    countdownText.textContent = "Hari ini kita ketemu.";
    countdownText.hidden = false;
  }
}


// ----- Tiup lilin -----
const cake = document.getElementById("cake");
const blowBtn = document.getElementById("blowBtn");
const relightBtn = document.getElementById("relightBtn");
const wishText = document.getElementById("wishText");

blowBtn.addEventListener("click", function () {
  cake.classList.add("off");
  blowBtn.hidden = true;
  relightBtn.hidden = false;
  wishText.hidden = false;
  confetti();
});

relightBtn.addEventListener("click", function () {
  cake.classList.remove("off");
  relightBtn.hidden = true;
  wishText.hidden = true;
  blowBtn.hidden = false;
});

// Confetti kecil berwarna coklat dan emas
function confetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const warna = ["#c68a5c", "#e6b97a", "#e8d5bd", "#f6ecdc", "#8a5a3a"];

  for (let i = 0; i < 50; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = warna[Math.floor(Math.random() * warna.length)];
    c.style.animationDuration = 2.5 + Math.random() * 2 + "s";
    c.style.animationDelay = Math.random() * 0.6 + "s";
    document.body.appendChild(c);

    setTimeout(function () {
      c.remove();
    }, 6000);
  }
}
