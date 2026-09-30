const test = require('node:test');
const assert = require('node:assert/strict');
const { parseReceipt } = require('./lib/ocr');

test('extracts sender and total', () => {
  assert.deepEqual(parseReceipt('Dari: Budi\nTotal: Rp125.000'), {
    sender: 'Budi', total: 125000, transferAt: null, bank: 'default', rawText: 'Dari: Budi\nTotal: Rp125.000'
  });
});

test('extracts sender after Rekening Sumber', () => {
  const text = 'Nominal Transfer Rp 15.000\nPipit Sari Dikrillah\nNama Penerima\nRangga Firmansyah\nRekening Sumber Bank Syariah Indonesia\n(BSI) —SaKAA766\nTotal Rp 15.000';
  assert.equal(parseReceipt(text).sender, 'Rangga Firmansyah');
  assert.equal(parseReceipt(text).total, 15000);
});

test('extracts transfer date and time', () => {
  const result = parseReceipt('08 Sep 2026 « 14:40:36\nTotal Rp 15.000');
  assert.equal(result.transferAt, '2026-09-08 14:40:36');
});

test('extracts WONDR BNI receipt', () => {
  const text = 'wondr by BNI\nTransfer berhasil\nRp100.000\n30 Sep 2026 · 06:07:15 WIB\nPenerima\nLAZ ASSYIFA PEDULI ZAKAT\nSumber dana\nROBET SUHADI\nNominal\nRp100.000\nTotal\nRp102.500';
  const result = parseReceipt(text);
  assert.equal(result.bank, 'bni');
  assert.equal(result.sender, 'ROBET SUHADI');
  assert.equal(result.total, 100000);
  assert.equal(result.transferAt, '2026-09-30 06:07:15');
});

test('extracts BSI Tokopedia receipt', () => {
  const text = 'Tanggal Transaksi: 27 Mar 2022 06:58:21\nNAMA: TKPTokopediaThoh\nJML BAYAR: 65500.0\nTOTAL DIBAYAR: Rp. 65.500';
  const result = parseReceipt(text, 'bsi');
  assert.equal(result.sender, 'TKPTokopediaThoh');
  assert.equal(result.total, 65500);
  assert.equal(result.transferAt, '2022-03-27 06:58:21');
});

test('extracts BCA m-Transfer receipt', () => {
  const result = parseReceipt('m-Transfer:\nBERHASIL\n26/09/2026 15:57:24\nKe 0555112004\nYAY ASSYIFA PEDULI INDON\nRp 100.000,00\nbunda ainun');
  assert.equal(result.bank, 'bca');
  assert.equal(result.sender, 'bunda ainun');
  assert.equal(result.total, 100000);
  assert.equal(result.transferAt, '2026-09-26 15:57:24');
});

test('extracts BCA virtual account receipt', () => {
  const result = parseReceipt('Transfer Successful\n25 Sep 2026 21:23:05\nBCA Virtual Account 3901085156232274\nName DNID RANXXX FIRXXXXXXX\nSource of Fund 055 - 1** - **90\nTotal Payment IDR 100,000.00');
  assert.equal(result.bank, 'bca');
  assert.equal(result.sender, '055 - 1** - **90');
  assert.equal(result.total, 100000);
  assert.equal(result.transferAt, '2026-09-25 21:23:05');
});

test('extracts Livin Mandiri receipt', () => {
  const result = parseReceipt('livin by mandiri\nTransfer Berhasil!\n26 Sep 2026 · 13:04:58 WIB\nPenerima\nLAZ ASSYIFA PEDULI ZAKAT\nNominal Transfer\nRp 500.000\nTotal Transaksi\nRp 502.500\nRekening Sumber\nWIDYA SOFYAN');
  assert.equal(result.bank, 'mandiri');
  assert.equal(result.sender, 'WIDYA SOFYAN');
  assert.equal(result.total, 500000);
  assert.equal(result.transferAt, '2026-09-26 13:04:58');
});

test('extracts SeaBank receipt', () => {
  const result = parseReceipt('SeaBank\nBukti Transaksi\nRp 834.000\nDari Fak h ita Ghaitsya Kamilah\nJumlah Transfer Rp 834.000\nWaktu Transaksi 27 Sep 2026, 13:31');
  assert.equal(result.bank, 'seabank');
  assert.equal(result.sender, 'Fak h ita Ghaitsya Kamilah');
  assert.equal(result.total, 834000);
  assert.equal(result.transferAt, '2026-09-27 13:31:00');
});

test('extracts Bank Muamalat receipt', () => {
  const result = parseReceipt('Bank Muamalat\nTRANSAKSI SUKSES\nWaktu: 2026-09-29 05:33:47.775\nRekening Sumber XXXXXXXX085\nNominal Rp 100.000\nTotal Rp 100.000');
  assert.equal(result.bank, 'muamalat');
  assert.equal(result.sender, 'XXXXXXXX085');
  assert.equal(result.total, 100000);
  assert.equal(result.transferAt, '2026-09-29 05:33:47');
});

test('extracts PermataBank receipt', () => {
  const result = parseReceipt('Permata Bank\nRESI TRANSFER\nKe\nLaz Assyifa Peduli Zakat\nJumlah\nRp 300,000\nDari\nRetno Setyaningrum\nPermata Bank\nWaktu\n29 Sep 2026, 15:34:31');
  assert.equal(result.bank, 'permata');
  assert.equal(result.sender, 'Retno Setyaningrum');
  assert.equal(result.total, 300000);
  assert.equal(result.transferAt, '2026-09-29 15:34:31');
});
