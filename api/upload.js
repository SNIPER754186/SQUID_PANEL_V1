import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // desactivar el body parser para recibir archivos
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = req.query.apikey;
  if (!apiKey) {
    return res.status(400).json({ error: 'Falta apiKey' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error al parsear formulario' });

    if (!files.file) return res.status(400).json({ error: 'No se encontró archivo' });

    const file = files.file;

    // Leer el archivo temporal
    const fs = require('fs');
    const path = require('path');
    const fetch = require('node-fetch');

    try {
      const stream = fs.createReadStream(file.filepath);

      const response = await fetch('https://pixeldrain.com/api/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: (() => {
          const FormData = require('form-data');
          const formData = new FormData();
          formData.append('file', stream, file.originalFilename);
          return formData;
        })(),
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ error: `Error de Pixeldrain: ${text}` });
      }

      const json = await response.json();
      return res.status(200).json(json);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
