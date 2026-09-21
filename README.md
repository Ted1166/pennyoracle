# PennyOracle

Ask a question. Pay one cent. Get an answer that's written on-chain, forever checkable by anyone.

PennyOracle is a pay-per-question oracle built on Arc. A wallet holding a small amount of USDC asks a question, a smart contract collects exactly $0.01, an AI answers in character, and the question-and-answer pair is anchored on-chain as a cryptographic hash, not a screenshot, not a claim, but an independently verifiable record.

## Why this needed a chain built for it

Micropayments have always had the same problem: the cost of moving the money exceeds the value of the thing being paid for. A one-cent transaction on most networks either isn't possible, or costs more in gas than the payment itself.

Arc removes that constraint. USDC on Arc is a single balance viewed two ways, a native 18-decimal view (what gas and direct transfers use) and a standard 6-decimal ERC-20 view (what `transfer`/`approve` use). There's no wrapping, no bridging, no second asset to manage. Combined with sub-cent gas and sub-second deterministic finality, a $0.01 payment becomes something that's actually practical to charge, settle and build a product around, not just a thought experiment.

PennyOracle exists to prove that out with something real: a genuine one-cent transaction, confirmed instantly, tied to a genuine AI response, with the whole exchange checkable by anyone after the fact.

## How it works

1. **Connect a wallet** holding a small amount of USDC on Arc.
2. **Ask a question.** The app requests a one-time approval, then calls the contract's `ask()` function.
3. **The contract debits $0.01 USDC** directly from the wallet's balance and emits an on-chain event. This is the actual payment, not a simulated one.
4. **A listener service picks up the event**, sends the question to an AI model with a distinct oracle personality, and gets back an answer.
5. **The answer is hashed and written back on-chain** through the contract's `fulfill()` function, alongside the human-readable answer served from a lightweight cache for fast reading.
6. **Anyone can verify it.** The client independently recomputes the hash of the displayed answer and compares it against the hash actually stored on-chain. If they match, the answer shown is provably the one that was paid for so the frontend and backend are never just trusted at their word.
7. **Every exchange is browsable** - a live public feed of everyone's questions and a personal history for each wallet.

## What problem this actually solves

- **Micropayments were previously impractical.** Gas costs on most chains make a one-cent charge economically pointless. Arc's fee structure makes it viable, and PennyOracle is a working demonstration of that, not a mockup.
- **AI outputs are usually unverifiable.** Once a model generates an answer, there's normally no way to prove later that the answer shown to you is the one actually generated at that moment. Anchoring the answer's hash on-chain turns "trust the API" into "check the chain."
- **Pay-to-use AI tools are usually locked behind subscriptions or opaque credit systems.** A per-question, stablecoin-denominated price is transparent: one question costs one cent, visible on-chain, no account, no recurring billing.
- **New chains are hard to demo meaningfully.** Most demo apps deployed to a new network don't actually exercise what makes that network different. PennyOracle only works the way it does *because* of Arc's decimal model and fee economics, it isn't portable to a typical L1 or L2 without losing the thing that makes it interesting.

## Where this could go

- **Micropayment rails for any pay-per-use service** - the same pattern (debit a cent, deliver a digital good, anchor a receipt) generalizes past Q&A to API calls, content unlocks, or per-request compute.
- **Verifiable AI as a building block.** Any application that needs to prove what an AI actually said, and when, can reuse the pay → generate → hash-on-chain pattern.
- **Financial inclusion through smaller unit economics.** Services priced in fractions of a cent become viable for users and use cases that a subscription or minimum-payment model excludes.

## Architecture

```
contracts/   Solidity contract (Foundry) - payment, event emission, permissioned fulfillment
backend/     Listener service - watches on-chain events, calls the AI, writes answers back
client/      Vite + React frontend - ask, browse the public feed, verify answers independently
```

The chain is the source of truth throughout. The backend's database is a read-speed cache, not a record of anything the client is asked to trust blindly meaning every answer displayed is checked against what's actually stored on Arc.

## Current limitations

- The oracle-fulfillment step is currently handled by a single backend signer. A production version would need either a decentralized set of fulfillers or a dispute/timeout mechanism for failed fulfillments.
- If AI generation fails after payment, the question is not yet automatically refunded, this is a known gap being addressed before wider release.
- This is presently deployed and tested on Arc testnet, with mainnet deployment as the next step.