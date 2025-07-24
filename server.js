const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Pasta pública para servir imagens
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configurando storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Página inicial com o formulário de upload (faz upload automático)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EQP IMP - UPLOAD</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; }
    body {
      background: #0f0f0f;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      animation: fadeIn 1s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    h1 {
      font-size: 2.5em;
      margin-bottom: 20px;
      color: #0ff;
      text-shadow: 0 0 10px #0ff5;
      animation: glow 2s infinite alternate;
    }

    @keyframes glow {
      from { text-shadow: 0 0 5px #0ff5; }
      to { text-shadow: 0 0 20px #0ff; }
    }

    form {
      background: #1a1a1a;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 0 20px #000a;
    }

    input[type="file"] {
      background: #000;
      padding: 10px;
      border: 2px dashed #0ff8;
      color: #fff;
      cursor: pointer;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h1>EQP IMP - UPLOAD</h1>
  <form id="uploadForm" enctype="multipart/form-data" method="POST" action="/upload">
    <input type="file" name="image" id="fileInput" accept="image/*" />
  </form>

  <script>
    document.getElementById('fileInput').addEventListener('change', function () {
      if (this.files.length > 0) {
        document.getElementById('uploadForm').submit();
      }
    });
  </script>
</body>
</html>
  `);
});

// Rota POST para fazer upload
app.post('/upload', upload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) return res.send("Erro ao fazer upload.");
  res.redirect(`/upload/${file.filename}`);
});

// Página com botão de download e link
app.get('/upload/:filename', (req, res) => {
  const filename = req.params.filename;
  const fileUrl = `/uploads/${filename}`;

  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload feito com sucesso!</title>
  <style>
    body {
      background: #0f0f0f;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: sans-serif;
      animation: fadeIn 1s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    h2 {
      margin-bottom: 20px;
      text-align: center;
    }

    input {
      width: 90%;
      max-width: 400px;
      padding: 10px;
      margin-bottom: 20px;
      border: none;
      border-radius: 8px;
      background: #222;
      color: #0ff;
      font-weight: bold;
      text-align: center;
    }

    button {
      padding: 12px 25px;
      font-size: 16px;
      background: linear-gradient(45deg, #0ff, #0f8);
      border: none;
      border-radius: 10px;
      color: #000;
      cursor: pointer;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 0 10px #0ff7; }
      50% { transform: scale(1.05); box-shadow: 0 0 25px #0ff; }
      100% { transform: scale(1); box-shadow: 0 0 10px #0ff7; }
    }

    .msg {
      margin-top: 15px;
      color: #0f0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h2>Imagem enviada com sucesso!</h2>
  <input type="text" value="${req.protocol}://${req.get('host')}/uploads/${filename}" id="link" readonly />
  <button onclick="startDownload()">Baixar</button>
  <div class="msg" id="msg"></div>

  <script>
    function startDownload() {
      document.getElementById('msg').innerText = "Iniciando download em 3 segundos...";
      setTimeout(() => {
        window.location.href = "${fileUrl}";
      }, 3000);
    }
  </script>
</body>
</html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
