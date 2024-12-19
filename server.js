const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');  // Untuk mengakses file SSL

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route untuk download video TikTok
app.post('/download', async (req, res) => {
    const { url } = req.body;

    // Validasi input URL
    if (!url || !url.includes('tiktok.com')) {
        return res.status(400).json({ success: false, message: 'URL tidak valid.' });
    }

    try {
        console.log('Memulai Puppeteer...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { timeout: 60000 });        

        console.log('Membuka URL:', url);
        await page.goto(url, { timeout: 60000 }); // Timeout 60 detik

        // Menunggu elemen video muncul
        await page.waitForSelector('video', { timeout: 30000 });

        // Mendapatkan link video
        const videoSrc = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            return videoElement ? videoElement.src : null;
        });

        // Tutup browser
        await browser.close();

        if (videoSrc) {
            console.log('Video berhasil ditemukan:', videoSrc);
            return res.status(200).json({ success: true, videoUrl: videoSrc });
        } else {
            throw new Error('Video tidak ditemukan di halaman.');
        }
    } catch (error) {
        console.error('Kesalahan Server:', error.message);
        return res.status(500).json({ success: false, message: 'Kesalahan Server. Silakan coba lagi nanti.' });
    }
});

// Membaca file SSL (gantilah dengan file yang valid di server Anda)
const options = {
    key: fs.readFileSync('path/to/your/private-key.pem'),  // Ganti dengan path ke private key Anda
    cert: fs.readFileSync('path/to/your/certificate.pem'), // Ganti dengan path ke sertifikat SSL Anda
    ca: fs.readFileSync('path/to/your/ca-certificate.pem') // Opsional, jika menggunakan CA
};

// Jalankan server menggunakan HTTPS
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server berjalan di https://localhost:${PORT}`);
});
