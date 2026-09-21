import type { FeedItem } from '../lib/types';

interface Props {
    item: FeedItem & { verified?: boolean };
}

export function AnswerCard({ item }: Props) {
    return (
        <article className="answer-card">
            <p className="answer-question">{item.question}</p>
            {item.fulfilled ? (
                <p className="answer-text">{item.answer}</p>
            ) : (
                <p className="answer-pending">The Oracle is thinking…</p>
            )}
            <div className="answer-meta">
                <span className="answer-asker">{shorten(item.asker)}</span>
                {item.fulfilled && (
                    <span className={item.verified ? 'answer-verified' : 'answer-unverified'}>
                        {item.verified ? 'Verified on Arc' : 'Verifying…'}
                    </span>
                )}
            </div>
        </article>
    );
}

function shorten(address: string) {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
