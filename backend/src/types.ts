export interface AskedEvent {
  id: bigint;
  asker: `0x${string}`;
  question: string;
  askedAt: bigint;
}

export interface QuestionRecord {
  id: string;
  asker: string;
  question: string;
  answer: string | null;
  answerHash: string | null;
  fulfilled: boolean;
  askedAt: number;
  fulfilledAt: number | null;
}
