import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// ES module path resolution helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Server-side Gemini API Proxy for the Networking Instructor
  app.post('/api/instructor-help', async (req: express.Request, res: express.Response) => {
    try {
      if (!apiKey) {
        return res.json({
          reply: "⚠️ API Key Gemini belum terkonfigurasi di Secrets. Silakan tambahkan 'GEMINI_API_KEY' di Settings > Secrets untuk mengaktifkan asisten AI interaktif. Namun, Anda tetap bisa memainkan game ini secara manual!"
        });
      }

      const { prompt, currentMission, chatHistory } = req.body;

      const systemInstruction = `Anda adalah Instruktur Ahli Teknik Komputer Jaringan (TKJ) SMK Negeri.
Nama Anda adalah "Instruktur Jar". Anda sangat berdedikasi, sabar, dan ramah.
Tugas Anda adalah membimbing siswa dalam menyelesaikan misi simulasi jaringan komputer di game "GAMEJar".
Saat ini siswa sedang berada pada misi: ${currentMission ? currentMission.title : 'Lobby Utama / Memilih Misi'}.
Detail Misi: ${currentMission ? currentMission.description : 'Siswa sedang melihat-lihat daftar misi.'}
Panduan Teknis Misi: ${currentMission ? currentMission.technicalGuide : ''}

ATURAN KOMUNIKASI:
1. Gunakan bahasa Indonesia yang santun, interaktif, memotivasi, dan mudah dipahami oleh anak SMK TKJ.
2. Jangan langsung memberikan perintah konfigurasi secara utuh atau instan. Bimbing mereka secara bertahap (step-by-step) agar mereka berpikir kritis.
3. Berikan konsep dasar jaringan (misal subnetting, VLAN, routing, DHCP, atau ACL) sebelum menyuruh mereka mengetik perintah.
4. Jawab pertanyaan siswa seputar jaringan secara akurat sesuai standar industri (seperti Cisco IOS atau Linux Networking).
5. Buat tanggapan yang ringkas, terarah, dan tidak terlalu panjang (maksimal 2-3 paragraf pendek) agar pas di sidebar UI yang padat.`;

      // Build discussion history context
      const historyContext = chatHistory && chatHistory.length > 0 
        ? chatHistory.map((ch: any) => `${ch.sender === 'user' ? 'Siswa' : 'Instruktur Jar'}: ${ch.text}`).join('\n')
        : '';

      const finalPrompt = `${historyContext ? 'Riwayat percakapan:\n' + historyContext + '\n\n' : ''}Siswa bertanya: ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: finalPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Gagal terhubung dengan instruktur AI.' });
    }
  });

  // Serve static assets or use Vite Dev Server
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[GAMEJar Server] Running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start GAMEJar server:', err);
});
