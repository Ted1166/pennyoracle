import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { fetchHistory } from '../lib/api';
import type { FeedItem } from '../lib/types';
import { AnswerCard } from './AnswerCard';

export function MyHistory() {
    const { address } = useAccount();
    const [items, setItems] = useState<FeedItem[]>([]);

    useEffect(() => {
        if (!address) return;
        let active = true;
        fetchHistory(address).then((data) => {
            if (active) setItems(data);
        });
        return () => {
            active = false;
        };
    }, [address]);

    if (!address) return <p className="feed-empty">Connect your wallet to see your history.</p>;
    if (items.length === 0) return <p className="feed-empty">You haven't asked anything yet.</p>;

    return (
        <div className="feed-list">
            {items.map((item) => (
                <AnswerCard key={item.id} item={item} />
            ))}
        </div>
    );
}
