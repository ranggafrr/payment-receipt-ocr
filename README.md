# Parsed OCR

API Node.js untuk membaca bukti transaksi bank dan mengambil nama pengirim, nominal, serta waktu transaksi.

## Menjalankan

```powershell
npm install
node server.js
```

Server berjalan di `http://localhost:3000`.

## Struktur project

```text
config/bank-profiles.json       aturan label tiap bank
lib/ocr.js                      engine Tesseract dan alur parser
lib/parser.js                   fungsi ekstraksi teks
src/controllers/ocr-controller.js  handler upload dan response
routes.js                       daftar endpoint
server.js                       konfigurasi Express
test.js                         test parser
```

## Testing dengan Postman

1. Method: `POST`
2. URL: `http://localhost:3000/ocr?bank=bsi`
3. Body → **binary** → pilih gambar bukti transaksi.
4. Klik **Send**.

`bank` opsional. Nilai yang tersedia: `bsi`, `bni`, `bca`, `mandiri`, `seabank`, `muamalat`, dan `permata`.

## Response

```json
{
  "status": "success",
  "message": "Gambar berhasil diproses",
  "data": {
    "sender": "Retno Setyaningrum",
    "amount": 300000,
    "transferAt": "2026-09-29 15:34:31",
    "bank": "permata"
  },
  "rawText": "hasil OCR"
}
```

`amount` berupa angka tanpa format rupiah. `transferAt` memakai format `Y-m-d H:i:s`.

## Konfigurasi bank

Aturan berada di `config/bank-profiles.json`:

```json
{
  "bsi": { "sender": "Rekening Sumber|NAMA:", "amount": "Total(?: DIBAYAR)?" },
  "bni": { "sender": "Sumber dana", "amount": "Nominal", "senderAfter": true },
  "bca": { "sender": "Source of Fund", "senderInline": true, "senderLast": true, "amount": "Total Payment|Rp|IDR" },
  "mandiri": { "sender": "Rekening Sumber", "amount": "Nominal Transfer", "senderAfter": true },
  "seabank": { "sender": "Dari", "senderInline": true, "amount": "Jumlah Total" },
  "muamalat": { "sender": "Rekening Sumber", "senderInline": true, "amount": "Nominal" },
  "permata": { "sender": "Dari", "senderInline": true, "senderAfter": true, "amount": "Jumlah" }
}
```

### Fungsi setiap object dan property

Object paling luar (`bsi`, `bni`, dan seterusnya) adalah **nama bank**. Nilainya adalah aturan untuk menemukan data pada raw text OCR.

- `sender`: label yang dicari untuk menemukan nama pengirim. Nilainya adalah regular expression, sehingga `|` berarti **atau**. Contoh `Rekening Sumber|NAMA:` cocok dengan dua label.
- `amount`: label yang dicari untuk menemukan nominal. Contoh `Total(?: DIBAYAR)?` cocok dengan `Total` dan `Total DIBAYAR`; `(?:...)` adalah grup regex opsional.
- `senderAfter`: jika `true`, nama pengirim berada di baris setelah label. Dipakai pada BNI dan Mandiri.
- `senderInline`: jika `true`, nama berada pada baris yang sama dengan label. Contoh `Dari Retno Setyaningrum`.
- `senderLast`: fallback yang mengambil baris terakhir jika label pengirim tidak ditemukan. Dipakai pada format BCA m-Transfer lama.

Contoh pembacaan BNI:

```text 
Sumber dana
ROBET SUHADI
```

Dengan `senderAfter: true`, hasil `sender` adalah `ROBET SUHADI`.

Contoh pembacaan Permata:

```text
Dari Retno Setyaningrum
```

Dengan `senderInline: true`, hasil `sender` adalah `Retno Setyaningrum`.

## Menambah bank atau format baru

Tambahkan object baru ke `config/bank-profiles.json`, lalu tambahkan deteksi bank di `detectBank()` jika bank tersebut perlu dideteksi otomatis. Jika hanya menggunakan `?bank=nama_bank`, konfigurasi JSON saja sudah cukup.

Setelah perubahan, jalankan:

```powershell
node --test
```

Jika raw OCR terlalu buruk, simpan `rawText`, perbaiki kualitas gambar/preprocessing, atau tambahkan aturan label yang sesuai.
