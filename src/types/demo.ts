import type { ExecutionEvent } from './execution'

export type DemoEvent = ExecutionEvent & { delayMs: number }
