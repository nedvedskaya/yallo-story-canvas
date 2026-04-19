import React from 'react';

/**
 * HookSlide — тип слайда "hook" для карусели ЯЛО
 * Стиль: Minimalism
 *
 * Пропсы:
 * — data: { title, highlight, subtitle, accent_text }
 * — style: { bgColor, textPrimary, textSecondary, textMuted, highlightColor, decorColor, chipBg }
 * — info: { username, pageNumber, totalPages, showUsername, showPageNumber, showArrow }
 */

const DEFAULT_STYLE = {
  bgColor: '#FFFFFF',
  textPrimary: '#0A0A0A',
  textSecondary: '#666666',
  textMuted: '#999999',
  highlightColor: '#CDE0FA',
  decorColor: '#E7F0FB',
  chipBg: '#F0F0F0',
  fontFamily: '"Cera Pro", "Inter", system-ui, -apple-system, sans-serif',
};

const DEFAULT_INFO = {
  username: '@username',
  pageNumber: 1,
  totalPages: 9,
  showUsername: true,
  showPageNumber: true,
  showArrow: true,
};

// SVG декоративная звезда/астериск
function DecorShape({ color }) {
  return (
    <svg viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
      <g fill={color}>
        <g transform="translate(140 140)">
          <rect x="-36" y="-126" width="72" height="150" rx="36" ry="36" />
          <rect x="-34" y="-122" width="68" height="146" rx="34" ry="34" transform="rotate(60)" />
          <rect x="-37" y="-128" width="74" height="152" rx="37" ry="37" transform="rotate(120)" />
          <rect x="-35" y="-124" width="70" height="148" rx="35" ry="35" transform="rotate(180)" />
          <rect x="-36" y="-126" width="72" height="150" rx="36" ry="36" transform="rotate(240)" />
          <rect x="-34" y="-120" width="68" height="144" rx="34" ry="34" transform="rotate(300)" />
          <circle cx="0" cy="0" r="58" />
          <circle cx="-8" cy="6" r="50" />
          <circle cx="10" cy="-4" r="46" />
        </g>
      </g>
    </svg>
  );
}

// SVG монограмма (треугольник-стрелка)
function Monogram({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <polygon points="0,36 18,0 36,36" fill={color} />
    </svg>
  );
}

// SVG стрелка "листать"
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 22, display: 'block' }}>
      <path d="M5 12 H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 6 L19 12 L13 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Рендер заголовка с хайлайтом
function TitleWithHighlight({ title, highlight, highlightColor, style }) {
  if (!highlight || !title.includes(highlight)) {
    return <span>{title}</span>;
  }
  const parts = title.split(highlight);
  return (
    <>
      {parts[0]}
      <mark style={{
        background: highlightColor,
        borderRadius: 4,
        padding: '2px 6px',
        fontStyle: 'normal',
        color: 'inherit',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }}>
        {highlight}
      </mark>
      {parts[1]}
    </>
  );
}

export default function HookSlide({ data = {}, style = {}, info = {} }) {
  const s = { ...DEFAULT_STYLE, ...style };
  const i = { ...DEFAULT_INFO, ...info };

  const {
    title = 'Почему одни бренды запоминаются сразу, а другие — нет?',
    highlight = 'запоминаются сразу,',
    subtitle = 'Потому что внимание нельзя купить.',
    accent_text = '',
  } = data;

  // Halftone dot паттерн через SVG data URI
  const dotPattern = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='%23CCCCCC' opacity='0.4'/></svg>")`;

  const slideStyle = {
    position: 'relative',
    width: 1080,
    height: 1350,
    background: s.bgColor,
    overflow: 'hidden',
    flexShrink: 0,
    fontFamily: s.fontFamily,
    color: s.textPrimary,
    WebkitFontSmoothing: 'antialiased',
  };

  const dotOverlayStyle = {
    position: 'absolute',
    inset: 0,
    backgroundImage: dotPattern,
    backgroundRepeat: 'repeat',
    backgroundSize: '20px 20px',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const topBarStyle = {
    position: 'absolute',
    top: '4.44%',
    left: '5.56%',
    right: '5.56%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  };

  const pageChipStyle = {
    width: 54,
    height: 54,
    borderRadius: '50%',
    background: s.chipBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
    fontWeight: 500,
    letterSpacing: '0.01em',
    color: s.textPrimary,
    fontFamily: s.fontFamily,
  };

  const decorStyle = {
    position: 'absolute',
    top: '13%',
    left: '9.26%',
    width: '29.6%',
    height: '23.7%',
    zIndex: 2,
  };

  const contentStyle = {
    position: 'absolute',
    top: '55%',
    left: '7.4%',
    right: '7.4%',
    zIndex: 4,
  };

  const titleStyle = {
    fontFamily: s.fontFamily,
    fontWeight: 700,
    fontSize: '5.5rem',
    lineHeight: 1.1,
    color: s.textPrimary,
    margin: 0,
    textAlign: 'left',
    letterSpacing: '-0.015em',
  };

  const subtitleStyle = {
    fontFamily: s.fontFamily,
    fontWeight: 400,
    fontSize: '1.375rem',
    lineHeight: 1.4,
    color: s.textSecondary,
    margin: '1.25rem 0 0 0',
    textAlign: 'left',
    maxWidth: '80%',
  };

  const bottomBarStyle = {
    position: 'absolute',
    bottom: '4.44%',
    left: '5.56%',
    right: '5.56%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  };

  const usernameStyle = {
    fontFamily: s.fontFamily,
    fontWeight: 400,
    fontSize: '1rem',
    color: s.textMuted,
    letterSpacing: '0.01em',
  };

  const swipeBtnStyle = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#FFFFFF',
    border: `1.3px solid ${s.textPrimary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: s.textPrimary,
  };

  return (
    <div style={slideStyle}>
      {/* Halftone dot overlay */}
      <div style={dotOverlayStyle} aria-hidden="true" />

      {/* Top bar */}
      <div style={topBarStyle}>
        <Monogram color={s.textPrimary} />
        {i.showPageNumber && (
          <div style={pageChipStyle}>
            {i.pageNumber}/{i.totalPages}
          </div>
        )}
      </div>

      {/* Декоративная форма */}
      <div style={decorStyle} aria-hidden="true">
        <DecorShape color={s.decorColor} />
      </div>

      {/* Основной контент */}
      <div style={contentStyle}>
        {accent_text && (
          <div style={{
            display: 'inline-block',
            background: s.highlightColor,
            borderRadius: 4,
            padding: '4px 12px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: s.textPrimary,
            marginBottom: '1rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {accent_text}
          </div>
        )}
        <h1 style={titleStyle}>
          <TitleWithHighlight
            title={title}
            highlight={highlight}
            highlightColor={s.highlightColor}
          />
        </h1>
        {subtitle && (
          <p style={subtitleStyle}>{subtitle}</p>
        )}
      </div>

      {/* Bottom bar */}
      <div style={bottomBarStyle}>
        {i.showUsername && (
          <div style={usernameStyle}>{i.username}</div>
        )}
        {i.showArrow && (
          <div style={swipeBtnStyle} aria-label="Листать">
            <ArrowIcon />
          </div>
        )}
      </div>
    </div>
  );
}
