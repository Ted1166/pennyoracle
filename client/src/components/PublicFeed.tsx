import { useFeed } from '../hooks/useFeed';
import { AnswerCard } from './AnswerCard';

export function PublicFeed() {
    const { items, loading } = useFeed();

    if (loading) return <p className="feed-empty">Loading the feed…</p>;
    if (items.length === 0) return <p className="feed-empty">No questions yet. Be the first.</p>;

    return (
        <div className="feed-list">
            {items.map((item) => (
                <AnswerCard key={item.id} item={item} />
            ))}
        </div>
    );
}
