import {type FormEvent, useState } from 'react';
import { useAsk } from '../hooks/useAsk';
import { useWallet } from '../hooks/useWallet';

export function AskForm() {
    const [question, setQuestion] = useState('');
    const { ask, status, error } = useAsk();
    const { isConnected, balance } = useWallet();

    const isBusy = status === 'approving' || status === 'asking';

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!question.trim() || isBusy) return;
        await ask(question.trim());
        setQuestion('');
    }

    return (
        <form className="ask-form" onSubmit={handleSubmit}>
            <label className="ask-label" htmlFor="question">
                Ask the Oracle, for a penny
            </label>
            <div className="ask-row">
                <input
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Will this idea work?"
                    disabled={!isConnected || isBusy}
                />
                <button type="submit" disabled={!isConnected || isBusy || !question.trim()}>
                    {status === 'approving' ? 'Approving' : status === 'asking' ? 'Asking' : 'Ask · $0.01'}
                </button>
            </div>
            {isConnected && (
                <p className="ask-balance">Balance: {(Number(balance) / 1e6).toFixed(2)} USDC on Arc</p>
            )}
            {error && <p className="ask-error">{error}</p>}
            {status === 'done' && <p className="ask-success">Sent. The Oracle is thinking.</p>}
        </form>
    );
}
