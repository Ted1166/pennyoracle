import type { FeedItem } from './types';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787';

export async function fetchFeed(limit = 20, offset = 0): Promise<FeedItem[]> {
  const res = await fetch(`${BASE_URL}/feed?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('failed to fetch feed');
  return res.json();
}

export async function fetchHistory(address: string, limit = 20, offset = 0): Promise<FeedItem[]> {
  const res = await fetch(`${BASE_URL}/history/${address}?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('failed to fetch history');
  return res.json();
}
