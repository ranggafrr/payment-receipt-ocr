require("dotenv").config();
const express = require("express");
const app = express();
const routes = require("./routes");

app.use(
  express.raw({ type: ["image/*", "application/octet-stream"], limit: "10mb" }),
);
app.get("/", (_req, res) =>
  res.json({
    status: "success",
    message: "OCR API is running",
    usage: "POST /ocr",
  }),
);
routes.forEach(({ method, path, controller }) => app[method](path, controller));

const { APP_HOST = "localhost", APP_PORT = 3000 } = process.env;
if (require.main === module)
  app.listen(APP_PORT, () =>
    console.log(`OCR API running at http://${APP_HOST}:${APP_PORT}`),
  );
module.exports = app;
