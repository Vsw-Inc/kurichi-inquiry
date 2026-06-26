type Props = {
  size?: number;
  blink?: boolean;
};

export default function ViBotAvatar({ size = 220, blink = false }: Props) {
  return (
    <svg
      viewBox="0 0 220 240"
      width={size}
      height={(size * 240) / 220}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ヴィーチェさん"
      className={blink ? "vibot-blink" : undefined}
    >
      <defs>
        <radialGradient id="vibot-cheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7a5a5" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#f7a5a5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vibot-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8a570" />
          <stop offset="100%" stopColor="#8c6f3f" />
        </linearGradient>
        <linearGradient id="vibot-apron" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8f1e2" />
          <stop offset="100%" stopColor="#e9dcbe" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="232" rx="60" ry="6" fill="#000" opacity="0.25" />

      {/* 体 / エプロン */}
      <path
        d="M 60 215 Q 60 175 110 170 Q 160 175 160 215 L 165 235 L 55 235 Z"
        fill="url(#vibot-apron)"
        stroke="#a89370"
        strokeWidth="2"
      />
      <path
        d="M 95 175 L 110 192 L 125 175"
        fill="none"
        stroke="#a89370"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* 葉のブローチ */}
      <g transform="translate(110 200)">
        <path d="M -8 0 Q -2 -8 6 -2 Q 0 6 -8 0" fill="#7fae6b" />
        <path d="M 6 -2 L 12 6" stroke="#5a8c4d" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* 後ろ髪 */}
      <ellipse cx="110" cy="115" rx="68" ry="74" fill="url(#vibot-hair)" />

      {/* 顔 */}
      <ellipse cx="110" cy="125" rx="54" ry="58" fill="#fde7c8" />

      {/* 前髪 */}
      <path
        d="M 56 100 Q 75 60 110 70 Q 145 60 164 100 Q 158 90 138 92 Q 130 80 110 84 Q 90 80 82 92 Q 62 90 56 100 Z"
        fill="url(#vibot-hair)"
      />
      <path
        d="M 92 70 Q 110 56 128 70 Q 122 64 110 64 Q 98 64 92 70"
        fill="#a78449"
      />

      {/* リボン */}
      <g transform="translate(160 80) rotate(20)">
        <ellipse cx="0" cy="0" rx="14" ry="8" fill="#d4a96a" />
        <ellipse cx="-12" cy="0" rx="6" ry="9" fill="#c69856" />
        <ellipse cx="12" cy="0" rx="6" ry="9" fill="#c69856" />
        <circle cx="0" cy="0" r="3" fill="#8c6f3f" />
      </g>

      {/* 頬 */}
      <ellipse cx="78" cy="148" rx="11" ry="7" fill="url(#vibot-cheek)" />
      <ellipse cx="142" cy="148" rx="11" ry="7" fill="url(#vibot-cheek)" />

      {/* 目 */}
      <g className="vibot-eyes">
        <ellipse cx="86" cy="132" rx="7" ry="9" fill="#2a1f10" />
        <ellipse cx="134" cy="132" rx="7" ry="9" fill="#2a1f10" />
        <circle cx="89" cy="129" r="2.4" fill="white" />
        <circle cx="137" cy="129" r="2.4" fill="white" />
        <circle cx="84" cy="135" r="1.2" fill="white" opacity="0.7" />
        <circle cx="132" cy="135" r="1.2" fill="white" opacity="0.7" />
      </g>

      {/* まゆ */}
      <path d="M 78 118 Q 86 114 94 118" stroke="#6f5535" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M 126 118 Q 134 114 142 118" stroke="#6f5535" strokeWidth="2.2" fill="none" strokeLinecap="round" />

      {/* 口 */}
      <path d="M 100 156 Q 110 164 120 156" stroke="#6b3e1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 102 157 Q 110 161 118 157" fill="#f4a098" opacity="0.6" />
    </svg>
  );
}
