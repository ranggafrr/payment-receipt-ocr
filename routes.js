const OcrController = require("./src/controllers/ocr-controller");

module.exports = [
  {
    method: "post",
    path: "/ocr",
    controller: OcrController.process,
  },
];
