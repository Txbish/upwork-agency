'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '@/components/brand/logo';

interface OrgSwitchOverlayProps {
  visible: boolean;
  orgName: string;
}

export function OrgSwitchOverlay({ visible, orgName }: OrgSwitchOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="org-switch-overlay"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-cream/96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start gap-7 px-10"
          >
            <Logo size={56} />

            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-storm/55">
                switching workspace
              </p>
              <h2 className="text-[44px] font-medium leading-[1] tracking-[-0.025em] text-ink">
                {orgName.toLowerCase()}
                <span className="text-orange">.</span>
              </h2>
            </div>

            {/* Three-dot progress, sequential pulse */}
            <div
              className="flex items-center gap-2 mt-2"
              role="status"
              aria-label={`Switching to ${orgName}`}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full bg-ink"
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
