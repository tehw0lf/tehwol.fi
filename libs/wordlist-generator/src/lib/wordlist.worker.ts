/// <reference lib="webworker" />

import { product } from 'cartesian-product-generator';

interface WordlistWorkerMessage {
  type: 'generate';
  charsets: string[];
  batchSize?: number;
}

interface WordlistWorkerResponse {
  type: 'batch' | 'complete' | 'error';
  words?: string[];
  error?: string;
}

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', ({ data }: MessageEvent<WordlistWorkerMessage>) => {
  if (data.type === 'generate') {
    try {
      generateWordlistBatches(data.charsets, data.batchSize || 1000);
    } catch (error) {
      const response: WordlistWorkerResponse = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      ctx.postMessage(response);
    }
  }
});

function generateWordlistBatches(charsets: string[], batchSize: number): void {
  const generator = product(...charsets);
  let batch: string[] = [];
  
  for (const wordArray of generator) {
    batch.push(wordArray.join(''));
    
    if (batch.length >= batchSize) {
      const response: WordlistWorkerResponse = {
        type: 'batch',
        words: batch
      };
      ctx.postMessage(response);
      batch = [];
    }
  }
  
  // Send remaining words
  if (batch.length > 0) {
    const response: WordlistWorkerResponse = {
      type: 'batch',
      words: batch
    };
    ctx.postMessage(response);
  }
  
  // Signal completion
  const completeResponse: WordlistWorkerResponse = {
    type: 'complete'
  };
  ctx.postMessage(completeResponse);
}