import MoonGlyph from './MoonGlyph';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-luna-aurora-lilac to-luna-aurora-pink flex items-center justify-center">
        <MoonGlyph size={14} />
      </div>

      {/* Bubble */}
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm">
        <span className="sr-only">Luna is thinking</span>
        <div className="flex items-center gap-1.5 h-4" aria-hidden="true">
          <span
            className="luna-dot w-1.5 h-1.5 rounded-full bg-luna-aurora-lilac"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="luna-dot w-1.5 h-1.5 rounded-full bg-luna-aurora-pink"
            style={{ animationDelay: '160ms' }}
          />
          <span
            className="luna-dot w-1.5 h-1.5 rounded-full bg-luna-aurora-lilac"
            style={{ animationDelay: '320ms' }}
          />
        </div>
      </div>
    </div>
  );
}
