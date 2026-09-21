import express from 'express';
import cors from 'cors';
import { config } from './config';
import { startListener } from './listener';
import { getFeed, getHistory, getById } from './store';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/feed', (req, res) => {
  const limit = Number(req.query.limit ?? 20);
  const offset = Number(req.query.offset ?? 0);
  res.json(getFeed(limit, offset));
});

app.get('/history/:address', (req, res) => {
  const limit = Number(req.query.limit ?? 20);
  const offset = Number(req.query.offset ?? 0);
  res.json(getHistory(req.params.address, limit, offset));
});

app.get('/question/:id', (req, res) => {
  const record = getById(req.params.id);
  if (!record) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json(record);
});

startListener();

app.listen(config.port, () => {
  console.log(`pennyoracle backend listening on ${config.port}`);
});
