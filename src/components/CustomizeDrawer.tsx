import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FileAudio, Image as ImageIcon, RotateCcw, Video, X } from 'lucide-react';
import type { BirthdayContentConfig } from '../config/birthdayContent';

interface CustomizeDrawerProps {
  open: boolean;
  content: BirthdayContentConfig;
  onClose: () => void;
  onUpdateContent: (updater: (prev: BirthdayContentConfig) => BirthdayContentConfig) => void;
  onResetDefaults: () => void;
}

/**
 * Unobtrusive personalization drawer allowing the creator to immediately swap in:
 * - Their own recorded piano audio (.mp3, .wav, .m4a)
 * - Reference portrait image for Section 1
 * - Consistent 3D character image or pre-rendered dancing video (.mp4 / .webm) for Section 2
 * - Recipient name, appreciation cards, hidden envelope note, and final birthday wish
 */
export const CustomizeDrawer: React.FC<CustomizeDrawerProps> = ({
  open,
  content,
  onClose,
  onUpdateContent,
  onResetDefaults,
}) => {
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    onUpdateContent((prev) => ({
      ...prev,
      assets: {
        ...prev.assets,
        customAudioUrl: objectUrl,
        audioTrackTitle: cleanName || 'Personal Piano Recording',
        audioTrackSubtitle: 'Your personal recording',
      },
    }));
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    onUpdateContent((prev) => ({
      ...prev,
      assets: {
        ...prev.assets,
        portrait2D: objectUrl,
        isCustomPortrait: true,
      },
    }));
  };

  const handleCharacterMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    onUpdateContent((prev) => ({
      ...prev,
      assets: {
        ...prev.assets,
        character3DVideo: isVideo ? objectUrl : null,
        character3DImage: isVideo ? prev.assets.character3DImage : objectUrl,
      },
    }));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="customize-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex justify-end bg-[#1D1829]/45 backdrop-blur-xs"
        >
          <motion.aside
            key="customize-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Personalize birthday story"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-[#FFFDF9] text-[#2E282A] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2E282A]/10 px-6 py-4">
              <div>
                <h2 className="font-serif text-2xl font-medium text-[#2E282A]">
                  Personalize Story
                </h2>
                <p className="text-xs text-[#665B5E]">
                  Preview your own piano recording, artwork, and notes
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close personalization drawer"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#665B5E] transition-colors hover:bg-[#2E282A]/6 hover:text-[#2E282A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {/* Media Replacements */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium tracking-[0.14em] text-[#8D79AE] uppercase">
                  Replaceable Media Assets
                </h3>

                {/* Piano Recording Upload */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#2E282A]/12 bg-[#FBF8F3] px-4 py-3 transition-colors hover:border-[#8D79AE]">
                  <FileAudio className="h-4 w-4 shrink-0 text-[#8D79AE]" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[#2E282A]">
                      Upload Piano Recording
                    </span>
                    <span className="block truncate text-xs text-[#665B5E]">
                      {content.assets.customAudioUrl
                        ? `Loaded: ${content.assets.audioTrackTitle}`
                        : 'Supports .mp3, .wav, .m4a (e.g. your piano cover)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="sr-only"
                  />
                </label>

                {/* 2D Portrait Upload */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#2E282A]/12 bg-[#FBF8F3] px-4 py-3 transition-colors hover:border-[#8D79AE]">
                  <ImageIcon className="h-4 w-4 shrink-0 text-[#C98698]" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[#2E282A]">
                      Replace Section 1 Portrait
                    </span>
                    <span className="block truncate text-xs text-[#665B5E]">
                      {content.assets.isCustomPortrait
                        ? 'Custom portrait active — replay sketch to preview'
                        : 'Upload a portrait photo or custom illustration'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortraitUpload}
                    className="sr-only"
                  />
                </label>

                {/* 3D Character Image or Video Upload */}
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#2E282A]/12 bg-[#FBF8F3] px-4 py-3 transition-colors hover:border-[#8D79AE]">
                  <Video className="h-4 w-4 shrink-0 text-[#6E8870]" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[#2E282A]">
                      Replace Section 2 Character (Image or Video)
                    </span>
                    <span className="block truncate text-xs text-[#665B5E]">
                      {content.assets.character3DVideo
                        ? 'Custom looping 3D video active'
                        : 'Supports .mp4, .webm loop or 3D character image'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm"
                    onChange={handleCharacterMediaUpload}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Editable Copy Fields */}
              <div className="space-y-4 border-t border-[#2E282A]/10 pt-5">
                <h3 className="text-xs font-medium tracking-[0.14em] text-[#8D79AE] uppercase">
                  Story Messages
                </h3>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#665B5E]">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={content.recipientName}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({ ...prev, recipientName: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#2E282A]/15 bg-white px-3 py-2 text-sm text-[#2E282A] focus:border-[#8D79AE] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#665B5E]">
                    Section 1 Portrait Quote
                  </label>
                  <textarea
                    rows={2}
                    value={content.section1.message}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        section1: { ...prev.section1, message: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-[#2E282A]/15 bg-white px-3 py-2 text-sm text-[#2E282A] focus:border-[#8D79AE] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#665B5E]">
                    Section 2 Garden Message
                  </label>
                  <textarea
                    rows={3}
                    value={content.section2.message}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        section2: { ...prev.section2, message: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-[#2E282A]/15 bg-white px-3 py-2 text-sm text-[#2E282A] focus:border-[#8D79AE] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[#665B5E]">
                    Section 4 Final Birthday Wish
                  </label>
                  <textarea
                    rows={3}
                    value={content.section4.wishBody}
                    onChange={(e) =>
                      onUpdateContent((prev) => ({
                        ...prev,
                        section4: { ...prev.section4, wishBody: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-[#2E282A]/15 bg-white px-3 py-2 text-sm text-[#2E282A] focus:border-[#8D79AE] focus:outline-none"
                  />
                </div>

                <div className="space-y-3 pt-1">
                  <span className="block text-xs font-medium text-[#665B5E]">
                    Scrapbook Appreciation Notes
                  </span>
                  {content.section3.cards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="rounded-lg border border-[#2E282A]/10 bg-[#FBF8F3] p-3"
                    >
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) =>
                          onUpdateContent((prev) => ({
                            ...prev,
                            section3: {
                              ...prev.section3,
                              cards: prev.section3.cards.map((c, i) =>
                                i === idx ? { ...c, title: e.target.value } : c
                              ),
                            },
                          }))
                        }
                        className="mb-1.5 w-full rounded border border-[#2E282A]/12 bg-white px-2.5 py-1 text-sm font-medium text-[#2E282A] focus:border-[#8D79AE] focus:outline-none"
                      />
                      <textarea
                        rows={3}
                        value={card.keepsakeNote}
                        onChange={(e) =>
                          onUpdateContent((prev) => ({
                            ...prev,
                            section3: {
                              ...prev.section3,
                              cards: prev.section3.cards.map((c, i) =>
                                i === idx ? { ...c, keepsakeNote: e.target.value } : c
                              ),
                            },
                          }))
                        }
                        className="w-full rounded border border-[#2E282A]/12 bg-white px-2.5 py-1 text-xs text-[#2E282A] focus:border-[#8D79AE] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-[#2E282A]/10 px-6 py-4">
              <button
                type="button"
                onClick={onResetDefaults}
                className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 text-xs text-[#665B5E] transition-colors hover:text-[#2E282A] whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset demo defaults</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] cursor-pointer rounded-full bg-[#2E282A] px-5 py-2 text-xs font-medium text-[#FBF8F3] transition-colors hover:bg-[#463D40] whitespace-nowrap"
              >
                Done
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
