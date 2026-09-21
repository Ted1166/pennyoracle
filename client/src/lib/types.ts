export interface FeedItem {
  id: string;
  asker: string;
  question: string;
  answer: string | null;
  answerHash: string | null;
  fulfilled: boolean;
  askedAt: number;
  fulfilledAt: number | null;
}

export interface VerifiedItem extends FeedItem {
  verified: boolean;
}
