import path from 'path';
import express from 'express';
import { app } from './server/app';
import { PORT } from './server/config';

// Serve frontend static assets from dist in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Frontend client-side SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sightline server listening on port ${PORT}`);
});
