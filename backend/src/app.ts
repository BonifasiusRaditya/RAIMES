const express = require('express');
import type { Request, Response } from 'express';

const app = express();
const port = 3000;

app.use(express.json());

// Rute sederhana
app.get('/', (req: Request, res: Response) => {
    res.send('Backend TypeScript berjalan!');
});

// Rute API contoh
app.get('/api/status', (req: Request, res: Response) => {
    // TypeScript memastikan data yang Anda kirim konsisten
    res.json({ status: 'OK', environment: process.env.NODE_ENV || 'development' });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
