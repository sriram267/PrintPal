/**
 * Quotation Module Public Barrel Contract
 * Only symbols exported here may be consumed by the UI shell or other modules.
 */

export * from './types';
export * from './backend/quotation.routes';
export * from './db/quotation.schema';
export { QuotationView } from '../leads/QuotationView';
export type { QuotationViewProps } from '../leads/QuotationView';

