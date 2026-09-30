const { createWorker } = require("tesseract.js");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const path = require("node:path");
const { linesOf, extractTransferAt, extractAmount, extractSender } = require("./parser");

const BANK_PROFILES = JSON.parse(fsSync.readFileSync(path.join(__dirname, "../config/bank-profiles.json"), "utf8"));

function detectBank(text) {
  if (/wondr|\bBNI\b/i.test(text)) return "bni";
  if (/m-transfer|\bBCA\b/i.test(text)) return "bca";
  if (/livin|bank mandiri/i.test(text)) return "mandiri";
  if (/seabank/i.test(text)) return "seabank";
  if (/bank muamalat|salam muamalat/i.test(text)) return "muamalat";
  if (/permata bank|permata/i.test(text)) return "permata";
  return /bank syariah indonesia|\(bsi\)/i.test(text) ? "bsi" : "default";
}

function parseReceipt(text, bank = detectBank(text), customKeys) {
  const keys = { ...(BANK_PROFILES[bank] || {}), ...(customKeys || {}) };
  const lines = linesOf(text);
  return {
    sender: extractSender(lines, keys.sender || "Dari|Pengirim|Sender", keys.senderAfter, keys.senderLast, keys.senderInline),
    total: extractAmount(lines, keys.amount || "Total"),
    transferAt: extractTransferAt(lines),
    bank,
    rawText: text,
  };
}

async function recognizeReceipt(filePath, bank, keys) {
  const sharp = require("sharp");
  const worker = await createWorker("ind");
  const processedPath = path.join(path.dirname(filePath), `.processed-${Date.now()}.png`);
  try {
    await sharp(filePath).resize({ width: 1200 }).grayscale().normalize().sharpen().png().toFile(processedPath);
    const { data: { text } } = await worker.recognize(processedPath);
    return parseReceipt(text, bank, keys);
  } finally {
    await worker.terminate();
    await fs.rm(processedPath, { force: true });
  }
}

module.exports = { parseReceipt, recognizeReceipt, detectBank, bankProfiles: BANK_PROFILES };
