
export const config = {
  api: {
    bodyParser: false,
  },
};

import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = req.query.apikey || "";
  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: "Archivo no válido" });
    }

    const file = files.file;
    const fileStream = fs.createReadStream(file.filepath);

    const formData = new FormData();
    formData.append("file", fileStream, file.originalFilename);

    try {
      const upload = await fetch("https://pixeldrain.com/api/file", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const result = await upload.json();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Error al subir a Pixeldrain" });
    }
  });
}
