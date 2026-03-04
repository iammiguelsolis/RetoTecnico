// Factory
export { RepositoryFactory } from './factory/RepositoryFactory';

// Observer
export { ExpenseSubject } from './observer/ExpenseSubject';
export { HighPriorityAlertObserver } from './observer/HighPriorityAlertObserver';
export { WhatsAppObserver } from './observer/WhatsAppObserver';

// Proxy
export { CacheExpenseProxy } from './proxy/CacheExpenseProxy';

// Strategy
export type { IExpenseFilterStrategy } from './strategy/IExpenseFilterStrategy';
export { ExpenseFilterContext } from './strategy/ExpenseFilterContext';
export { FilterByMonthStrategy } from './strategy/FilterByMonthStrategy';
export { FilterByPriorityStrategy } from './strategy/FilterByPriorityStrategy';
