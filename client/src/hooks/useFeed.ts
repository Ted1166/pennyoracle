import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { keccak256, toBytes } from 'viem';
import { fetchFeed } from '../lib/api';
import { CONTRACT_ADDRESS, pennyOracleAbi } from '../lib/contract';
import type { VerifiedItem } from '../lib/types';

export function useFeed(pollMs = 6000) {
  const publicClient = usePublicClient();
  const [items, setItems] = useState<VerifiedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const feed = await fetchFeed();
        if (!active || !publicClient) return;

        const verified = await Promise.all(
          feed.map(async (item) => {
            if (!item.answer || !item.answerHash) {
              return { ...item, verified: false };
            }
            const onChain = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: pennyOracleAbi,
              functionName: 'getQuestion',
              args: [BigInt(item.id)]
            });
            const onChainHash = onChain[2];
            const computedHash = keccak256(toBytes(item.answer));
            return { ...item, verified: onChainHash.toLowerCase() === computedHash.toLowerCase() };
          })
        );

        if (active) {
          setItems(verified);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    }

    load();
    const interval = setInterval(load, pollMs);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [publicClient, pollMs]);

  return { items, loading };
}
