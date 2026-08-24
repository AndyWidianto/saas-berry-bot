import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Loader2, PlusCircle, Globe } from 'lucide-react';
import { Btn } from './Button';

interface ModalAddUrlKnowledgeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ModalAddUrlKnowledge({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: ModalAddUrlKnowledgeProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    await onSubmit(url);
    setUrl('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Import Knowledge from URL
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Scrape and vectorize website pages, FAQs, or online documentation.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Website URL
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/docs"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isLoading}
                      className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
                <Btn
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Btn>
                <Btn
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={isLoading ? Loader2 : PlusCircle}
                  disabled={isLoading || !url.trim()}
                >
                  {isLoading ? 'Processing' : 'Fetch & Index'}
                </Btn>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}