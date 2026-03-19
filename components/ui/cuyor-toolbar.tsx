"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Cross2Icon,
  InfoCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import CuyorIcon from "./cuyor-icon";

const CURSOR_OFFSET = { x: 24, y: -12 } as const;
const TOOLBAR_SIZE = { w: 36, h: 36 } as const;

const SPRING_BASE = {
  type: "spring",
  stiffness: 280,
  damping: 26,
  mass: 0.7,
} as const;

const TRANSITION = {
  icon: { ...SPRING_BASE, delay: 1 },
  field: { ...SPRING_BASE, delay: 0.55 },
  toggle: { ...SPRING_BASE, delay: 0 },
} as const;

const TIPS = [
  "Press Ctrl+Shift to open Cuyor anytime",
  "Ask me where any button is located",
  "I can guide you through complex settings",
  "Works in Figma, VS Code, AWS, and more",
  "Say 'help me find...' to start navigating",
];

export default function CuyorToolbar() {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number>(0);
  const hasMoved = useRef(false);
  const isMounted = useRef(false);
  const isTypingRef = useRef(false);

  const [visible, setVisible] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const el = toolbarRef.current;
        if (!el) return;

        const { clientWidth: vw, clientHeight: vh } = document.documentElement;
        const x = Math.max(
          0,
          Math.min(e.clientX + CURSOR_OFFSET.x, vw - TOOLBAR_SIZE.w),
        );
        const y = Math.max(
          0,
          Math.min(e.clientY + CURSOR_OFFSET.y, vh - TOOLBAR_SIZE.h),
        );

        if (!isTypingRef.current) {
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        if (!hasMoved.current) {
          hasMoved.current = true;
          setVisible(true);
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        isMounted.current = true;
        setFieldOpen((prev) => !prev);
        setShowTip(false);
      }
      if (e.key === "Escape" && fieldOpen) {
        setFieldOpen(false);
        setShowTip(false);
      }

      isTypingRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fieldOpen]);

  useEffect(() => {
    if (!fieldOpen) return;
    const id = setTimeout(() => textareaRef.current?.focus(), 200);
    return () => clearTimeout(id);
  }, [fieldOpen]);

  // Rotate tips
  useEffect(() => {
    if (!showTip) return;
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showTip]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const ta = e.target;
      setInputValue(ta.value);
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
      isTypingRef.current = true;
    },
    [],
  );

  const toggleField = useCallback(() => {
    isMounted.current = true;
    setFieldOpen((prev) => !prev);
    setShowTip(false);
    isTypingRef.current = false;
  }, []);

  const toggleTip = useCallback(() => {
    setShowTip((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    setInputValue("");
    setFieldOpen(false);
  }, [inputValue]);

  const fieldTransition = isMounted.current
    ? TRANSITION.toggle
    : TRANSITION.field;

  return (
    <div
      ref={toolbarRef}
      className="fixed top-0 left-0 z-50 flex flex-col items-start gap-2"
      style={{
        willChange: "transform",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.2s ease",
      }}
    >
      <div className="flex items-start gap-2">
        {/* Main Icon Button */}
        <motion.button
          type="button"
          aria-label="Toggle search field"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 180 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          transition={TRANSITION.icon}
          onClick={toggleField}
          className="glass-morphism w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/20 transition-colors"
        >
          <CuyorIcon size={18} />
        </motion.button>

        {/* Text field */}
        <AnimatePresence mode="wait">
          {fieldOpen && (
            <motion.div
              key="field"
              initial={{ width: 0, opacity: 0, scale: 0.96 }}
              animate={{ width: 280, opacity: 1, scale: 1 }}
              exit={{ width: 0, opacity: 0, scale: 0.96 }}
              transition={fieldTransition}
              style={{ originX: 0, overflow: "hidden" }}
              className="glass-morphism min-h-9 rounded-[18px] px-3 py-1.5 flex items-start gap-2"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                placeholder="Where should I click?"
                autoComplete="off"
                onChange={handleInput}
                onFocus={() => {
                  isTypingRef.current = true;
                }}
                onBlur={() => {
                  isTypingRef.current = false;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                className="outline-none border-none flex-1 bg-transparent resize-none overflow-hidden leading-normal text-sm mt-0.5"
                style={{ maxHeight: 100 }}
              />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={toggleTip}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                  title="Tips"
                >
                  <QuestionMarkCircledIcon className="w-3.5 h-3.5 text-foreground/40" />
                </button>
                <button
                  onClick={toggleField}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                >
                  <Cross2Icon className="w-3.5 h-3.5 text-foreground/40" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips Panel */}
      <AnimatePresence>
        {showTip && fieldOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="ml-11 glass-morphism rounded-[18px] px-4 py-3 w-70"
          >
            <div className="flex items-start gap-2">
              <InfoCircledIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {TIPS[currentTip]}
                </p>
                <div className="flex gap-1 mt-2">
                  {TIPS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === currentTip ? "bg-primary" : "bg-foreground/20"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
