export * from "./database";

export interface OpenPosition {
  symbol: string;
  quantity: number;
  currentPrice?: number;
  value?: number;
}
