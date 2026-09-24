/**
 * Payment Rails Registry
 * Pluggable factory supporting e-Transfer, Card, and ACH/EFT
 */

import { IRailProcessor, PaymentRail } from '../../types/rails';
import { etransferRail } from './etransfer';
import { cardRail } from './card';

const RAIL_REGISTRY = new Map<PaymentRail, IRailProcessor>();

// Register default supported rails
RAIL_REGISTRY.set('ETRANSFER', etransferRail);
RAIL_REGISTRY.set('CARD', cardRail);

export function registerRail(processor: IRailProcessor): void {
  RAIL_REGISTRY.set(processor.railId, processor);
}

export function getRailProcessor(railId: PaymentRail = 'ETRANSFER'): IRailProcessor {
  const processor = RAIL_REGISTRY.get(railId);
  if (!processor) {
    console.warn(`Rail ${railId} not found in registry. Falling back to ETRANSFER.`);
    return etransferRail;
  }
  return processor;
}

export function listSupportedRails(): { id: PaymentRail; name: string; description: string }[] {
  return Array.from(RAIL_REGISTRY.values()).map(p => ({
    id: p.railId,
    name: p.name,
    description: p.description
  }));
}
