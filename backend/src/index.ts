import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const publicDir = path.join(__dirname, '..', 'public');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api', routes);

// Serve frontend build when present (e.g. Docker / production)
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
}

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
