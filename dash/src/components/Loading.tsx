import { motion } from 'framer-motion';

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative w-14 h-14">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-hairline"
          aria-hidden
        />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#7C7E2C', borderRightColor: '#7C7E2C' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-3 rounded-full"
          style={{ background: '#7C7E2C' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="text-center space-y-1.5">
        <p className="caption-up text-olive">Streaming</p>
        <p className="text-body text-sm">Fetching share manifest…</p>
      </div>
    </div>
  );
};
