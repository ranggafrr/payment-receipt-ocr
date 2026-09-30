const fs = require("node:fs/promises");
const path = require("node:path");
const { recognizeReceipt } = require("../../lib/ocr");

async function process(req, res) {
  const tempFile = path.join(__dirname, `.upload-${Date.now()}`);
  try {
    if (!req.body?.length) {
      return res
        .status(400)
        .json({
          status: "error",
          upload: "failed",
          error: "Request body tidak boleh kosong",
        });
    }
    await fs.writeFile(tempFile, req.body);
    const result = await recognizeReceipt(tempFile, req.query.bank);
    return res.json({
      status: "success",
      message: "Gambar berhasil diproses",
      data: {
        sender: result.sender,
        amount: result.total,
        transferAt: result.transferAt,
        bank: result.bank,
      },
      rawText: result.rawText,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", upload: "failed", error: error.message });
  } finally {
    await fs.rm(tempFile, { force: true });
  }
}

module.exports = { process };
