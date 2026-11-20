export type BoundaryState = { failed: boolean; message: string };

export function captureBoundary(error: Error): BoundaryState {
  return { failed: true, message: error.message || 'Falha sem mensagem' };
}

export function clearBoundary(): BoundaryState {
  return { failed: false, message: '' };
}

export function boundaryChangesWithKey(previousKey: string, nextKey: string, failed: boolean) {
  return failed && previousKey !== nextKey;
}
