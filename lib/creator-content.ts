export type ContentBlock =
  | { id: string; type: 'text'; text: string; url?: never; productIds?: never }
  | { id: string; type: 'image'; url: string; text?: never; productIds?: never }
  | { id: string; type: 'video'; url: string; text?: never; productIds?: never }
  | { id: string; type: 'group' | 'product'; productIds: string[]; text?: never; url?: never };

export function readContentBlocks(blocks?: unknown, fallbackText?: string, productIds?: string[]): ContentBlock[] {
  if (Array.isArray(blocks) && blocks.length > 0) {
    return blocks as ContentBlock[];
  }
  const result: ContentBlock[] = [];
  if (fallbackText) {
    result.push({ id: 'fallback-text', type: 'text', text: fallbackText });
  }
  if (productIds && productIds.length > 0) {
    result.push({ id: 'fallback-products', type: 'group', productIds });
  }
  return result;
}
