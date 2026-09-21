import { useState } from 'react';
import { WalletButton } from './components/WalletButton';
import { AskForm } from './components/AskForm';
import { PublicFeed } from './components/PublicFeed';
import { MyHistory } from './components/MyHistory';
import { OracleAvatar } from './components/OracleAvatar';

type Tab = 'feed' | 'history';

export default function App() {
  const [tab, setTab] = useState<Tab>('feed');

  return (
    <div className="page">
      <header className="topbar">
        <span className="brand">PennyOracle</span>
        <WalletButton />
      </header>

      <section className="hero">
        <OracleAvatar />
        <h1>Ask the Oracle, for a penny.</h1>
        <p className="hero-sub">One cent in USDC. An instant answer. A permanent record on Arc.</p>
        <AskForm />
      </section>

      <section className="board">
        <div className="board-tabs">
          <button className={tab === 'feed' ? 'active' : ''} onClick={() => setTab('feed')}>
            Public feed
          </button>
          <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
            Your history
          </button>
        </div>
        {tab === 'feed' ? <PublicFeed /> : <MyHistory />}
      </section>
    </div>
  );
}
