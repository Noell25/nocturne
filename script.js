let tipePintu = "";

document.addEventListener('DOMContentLoaded', () => {
    const tema = localStorage.getItem('temaPilihan') || 'tema-gelap';
    document.body.classList.remove('tema-gelap', 'tema-sepia', 'tema-terang');
    document.body.classList.add(tema);

    if (document.getElementById('pilihan-pintu')) {
        // Sembunyikan form login di awal
        document.getElementById('form-login').classList.add('tersembunyi');
        inisialisasiGerbang();
    } else if (document.getElementById('wadah-cerpen')) {
        inisialisasiRuangBaca();
    } else if (document.getElementById('btn-publish')) {
        inisialisasiRuangTulis();
    }
});

// Switcher Tema Warna
document.querySelectorAll('.btn-tema').forEach(btn => {
    btn.addEventListener('click', () => {
        const tema = btn.getAttribute('data-tema');
        document.body.classList.remove('tema-gelap', 'tema-sepia', 'tema-terang');
        document.body.classList.add(tema);
        localStorage.setItem('temaPilihan', tema);
    });
});

function logout() {
    sessionStorage.removeItem('sesiNocturne');
    window.location.href = 'index.html';
}

// Logika Gerbang & Login
function inisialisasiGerbang() {
    const btnMasuk = document.getElementById('btn-proses-login');
    btnMasuk.addEventListener('click', () => {
        const nama = document.getElementById('input-nama').value.trim();
        const sandi = document.getElementById('input-sandi').value.trim();

        if (!nama || sandi.length < 4) {
            alert("Isi nama dan kata sandi minimal 4 karakter dulu ya!");
            return;
        }

        sessionStorage.setItem('sesiNocturne', JSON.stringify({ nama, tipe: tipePintu }));

        if (tipePintu === 'baca') {
            window.location.href = 'baca.html';
        } else {
            window.location.href = 'tulis.html';
        }
    });
}

function pilihPintu(tujuan) {
    tipePintu = tujuan;
    document.getElementById('pilihan-pintu').classList.add('tersembunyi');
    document.getElementById('form-login').classList.remove('tersembunyi');
    document.getElementById('judul-login').textContent = tujuan === 'baca' ? 'Login Ruang Baca' : 'Login Ruang Tulis';
    document.getElementById('input-nama').focus();
}

function kembaliKePilihan() {
    document.getElementById('form-login').classList.add('tersembunyi');
    document.getElementById('pilihan-pintu').classList.remove('tersembunyi');
    document.getElementById('input-nama').value = "";
    document.getElementById('input-sandi').value = "";
}

// Logika Ruang Baca
function inisialisasiRuangBaca() {
    const sesi = JSON.parse(sessionStorage.getItem('sesiNocturne'));
    if (!sesi) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('sapaan-user').textContent = `Halo, ${sesi.nama}`;
    muatDaftarCerita();

    document.getElementById('btn-tutup-baca').addEventListener('click', () => {
        document.getElementById('modal-baca').classList.add('tersembunyi');
    });
}

function muatDaftarCerita() {
    const wadah = document.getElementById('wadah-cerpen');
    let daftar = JSON.parse(localStorage.getItem('cerpenKu')) || [];
    wadah.innerHTML = "";

    if (daftar.length === 0) {
        wadah.innerHTML = `<p style="color: var(--teks-sekunder); grid-column: 1/-1; text-align:center; padding: 50px 0;">Belum ada cerita di rak.</p>`;
        return;
    }

    daftar.forEach(c => {
        const kartu = document.createElement('article');
        kartu.className = 'kartu-cerpen';
        const cuplikan = c.isi.length > 120 ? c.isi.substring(0, 120) + "..." : c.isi;

        kartu.innerHTML = `
            <div>
                <span class="badge-genre">${c.genre}</span>
                <h3>${c.judul}</h3>
                <p class="penulis">Oleh ${c.penulis}</p>
                <p class="cuplikan">${cuplikan}</p>
            </div>
            <div class="kartu-bawah">
                <button class="btn-baca" onclick="bacaCerita(${c.id})">Baca →</button>
                <button class="btn-hapus" onclick="hapusCerita(${c.id})">Hapus</button>
            </div>
        `;
        wadah.appendChild(kartu);
    });
}

function bacaCerita(id) {
    let daftar = JSON.parse(localStorage.getItem('cerpenKu')) || [];
    const c = daftar.find(item => item.id === id);
    if (c) {
        document.getElementById('baca-genre').textContent = c.genre;
        document.getElementById('baca-judul').textContent = c.judul;
        document.getElementById('baca-penulis').textContent = `Ditulis oleh ${c.penulis}`;
        document.getElementById('baca-isi').textContent = c.isi;
        document.getElementById('modal-baca').classList.remove('tersembunyi');
    }
}

function hapusCerita(id) {
    if (confirm("Hapus cerita ini?")) {
        let daftar = JSON.parse(localStorage.getItem('cerpenKu')) || [];
        daftar = daftar.filter(item => item.id !== id);
        localStorage.setItem('cerpenKu', JSON.stringify(daftar));
        muatDaftarCerita();
    }
}

// Logika Ruang Tulis
function inisialisasiRuangTulis() {
    const sesi = JSON.parse(sessionStorage.getItem('sesiNocturne'));
    if (!sesi) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('sapaan-user').textContent = `Halo, ${sesi.nama}`;
    document.getElementById('label-penulis-aktif').textContent = sesi.nama;

    const inputIsi = document.getElementById('input-isi');
    const hitungKata = document.getElementById('hitung-kata');

    inputIsi.addEventListener('input', () => {
        const kata = inputIsi.value.trim();
        hitungKata.textContent = `${kata ? kata.split(/\s+/).length : 0} kata`;
    });

    document.getElementById('btn-publish').addEventListener('click', () => {
        const judul = document.getElementById('input-judul').value.trim();
        const genre = document.getElementById('input-genre').value;
        const isi = inputIsi.value.trim();

        if (!judul || !isi) {
            alert("Judul dan isi cerita wajib diisi!");
            return;
        }

        const baru = {
            id: Date.now(),
            judul,
            penulis: sesi.nama,
            genre,
            isi
        };

        let daftar = JSON.parse(localStorage.getItem('cerpenKu')) || [];
        daftar.unshift(baru);
        localStorage.setItem('cerpenKu', JSON.stringify(daftar));

        alert("Cerita berhasil diterbitkan ke Ruang Baca!");
        window.location.href = 'baca.html';
    });
}