const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Config multer com pasta uploads e renomeia arquivos com extensão
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.round(Math.random()*1e9)}${ext}`);
  }
});
const upload = multer({ storage });

app.use(express.static('uploads'));

// Rota principal - upload automático
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EQP IMP - UPLOAD</title>
    <style>
      * {
        margin: 0; padding: 0; box-sizing: border-box;
      }
      body {
        font-family: 'Arial', sans-serif;
        background: radial-gradient(circle at top, #111, #000);
        color: white;
        text-align: center;
        height: 100vh;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        animation: fadeIn 1.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      h1 {
        font-size: 2.4em;
        margin-bottom: 20px;
        color: #0ff;
        text-shadow: 0 0 10px #0ff8, 0 0 20px #0ff4;
        animation: float 2.5s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      .container {
        background: rgba(255,255,255,0.03);
        padding: 20px;
        border-radius: 15px;
        backdrop-filter: blur(6px);
        box-shadow: 0 0 10px #0ff3;
        width: 90%;
        max-width: 400px;
        animation: fadeIn 1.5s ease 0.3s both;
      }

      input[type="file"] {
        margin-top: 10px;
        margin-bottom: 20px;
        width: 100%;
        background: none;
        color: white;
        cursor: pointer;
      }

      button {
        padding: 10px 20px;
        background: linear-gradient(45deg, #0ff, #08f, #0ff);
        border: none;
        border-radius: 10px;
        color: black;
        font-weight: bold;
        cursor: pointer;
        animation: pulse 3s infinite;
        transition: all 0.3s ease;
        display: none;
      }

      button:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px #0ff8;
      }

      @keyframes pulse {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    </style>
  </head>
  <body>
    <h1>EQP IMP - UPLOAD</h1>
    <div class="container">
      <input id="fileInput" type="file" accept="image/*" />
    </div>

    <script>
      const fileInput = document.getElementById('fileInput');
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);

        // mostra mensagem ou loader aqui se quiser

        const res = await fetch('/upload', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (data.filename) {
          // redireciona pra página de upload com preview e botão de download
          window.location.href = '/upload/' + data.filename;
        } else {
          alert('Erro ao enviar a imagem.');
        }
      });
    </script>
  </body>
  </html>
  `);
});

// Upload route
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Arquivo não encontrado.' });
  res.json({ filename: req.file.filename });
});

// Página upload + preview + link + botão download animado
app.get('/upload/:filename', (req, res) => {
  const file = req.params.filename;
  const fullUrl = `${req.protocol}://${req.get('host')}/${file}`;

  res.send(`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EQP IMP - UPLOAD</title>
    <style>
      * {
        margin: 0; padding: 0; box-sizing: border-box;
      }
      body {
        font-family: 'Arial', sans-serif;
        background: radial-gradient(circle at top, #111, #000);
        color: white;
        text-align: center;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        animation: fadeIn 1.2s ease;
        padding: 20px;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      h1 {
        font-size: 2.4em;
        margin-bottom: 20px;
        color: #0ff;
        text-shadow: 0 0 10px #0ff8, 0 0 20px #0ff4;
        animation: float 2.5s ease-in-out infinite;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      img {
        max-width: 90vw;
        max-height: 60vh;
        border-radius: 15px;
        box-shadow: 0 0 15px #0ff4;
        margin-bottom: 20px;
      }
      .link-box {
        background: rgba(255,255,255,0.1);
        padding: 10px 15px;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        margin-bottom: 25px;
        user-select: all;
        font-size: 1.1em;
        overflow-wrap: break-word;
      }
      button {
        padding: 12px 28px;
        background: linear-gradient(45deg, #0ff, #08f, #0ff);
        border: none;
        border-radius: 12px;
        color: black;
        font-weight: bold;
        font-size: 1.2em;
        cursor: pointer;
        animation: pulse 3s infinite;
        transition: all 0.3s ease;
        user-select: none;
      }
      button:hover {
        transform: scale(1.05);
        box-shadow: 0 0 25px #0ff8;
      }
      @keyframes pulse {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    </style>
  </head>
  <body>
    <h1>EQP IMP - UPLOAD</h1>
    <img src="/${file}" alt="Imagem enviada" />
    <div class="link-box" id="link">${fullUrl}</div>
    <button id="btnDownload">Baixar Imagem</button>

    <script>
      const btnDownload = document.getElementById('btnDownload');
      const linkBox = document.getElementById('link');

      btnDownload.addEventListener('click', () => {
        let seconds = 3;
        btnDownload.textContent = \`Iniciando download em \${seconds}...\`;
        const interval = setInterval(() => {
          seconds--;
          if(seconds > 0) {
            btnDownload.textContent = \`Iniciando download em \${seconds}...\`;
          } else {
            clearInterval(interval);
            btnDownload.textContent = 'Baixar Imagem';

            // Cria link temporário para forçar download
            const a = document.createElement('a');
            a.href = '${fullUrl}';
            a.download = '${file}';
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
        }, 1000);
      });

      // Clique na URL copia o link pro clipboard
      linkBox.addEventListener('click', () => {
        navigator.clipboard.writeText(linkBox.textContent)
          .then(() => alert('Link copiado!'))
          .catch(() => alert('Falha ao copiar link.'));
      });
    </script>
  </body>
  </html>
  `);
});

app.listen(PORT, () => console.log(`🔥 EQP IMP UPLOAD rodando em http://localhost:${PORT}`));