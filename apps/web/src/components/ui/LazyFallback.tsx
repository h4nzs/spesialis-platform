/**
 * Shared Suspense fallback — centered spinner for lazy-loaded modals.
 *
 * Usage:
 *   <Suspense fallback={<LazyFallback />}>
 *     <LazyComponent />
 *   </Suspense>
 */
import { Spinner } from '@ahlipanggilan/ui';

export function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="lg" />
    </div>
  );
}
