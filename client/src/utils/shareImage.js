// ─────────────────────────────────────────────────────────────
// Turns a text post into a branded PNG image IN THE BROWSER
// (no Cloudinary / no server storage) and shares it.
//   • Phones: opens the share sheet (WhatsApp, Instagram, Status…)
//   • Computers / older browsers: downloads the image instead
// ─────────────────────────────────────────────────────────────

const W = 1080;
const H = 1350; // 4:5 — fits WhatsApp Status and Instagram well

// Break text into lines that fit the given width
const wrapText = (ctx, text, maxWidth) => {
  const lines = [];
  text.split('\n').forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) { lines.push(''); return; }
    let line = '';
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    lines.push(line);
  });
  return lines;
};

// roundRect isn't in older phone browsers → plain rectangle fallback
const roundRect = (ctx, x, y, w, h, r) => {
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
};

const drawCross = (ctx, cx, cy, size, color) => {
  const s = size / 64;
  ctx.fillStyle = color;
  const r = (x, y, w, h) => {
    ctx.beginPath();
    roundRect(ctx, cx + (x - 32) * s, cy + (y - 32) * s, w * s, h * s, 3 * s);
    ctx.fill();
  };
  r(28, 6, 8, 52);
  r(12, 18, 40, 8);
};

export const renderPostImage = async (post) => {
  // Make sure the fonts are ready before drawing
  try {
    await Promise.all([
      document.fonts.load('700 40px Cinzel'),
      document.fonts.load('500 40px Inter'),
      document.fonts.load('700 40px Inter'),
    ]);
  } catch { /* fall back to system fonts */ }

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background — deep gold gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#5C4300');
  bg.addColorStop(0.45, '#9A7209');
  bg.addColorStop(1, '#C8960A');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft decorative circles
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 60;
  ctx.beginPath(); ctx.arc(W - 80, 120, 260, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(60, H - 80, 200, 0, Math.PI * 2); ctx.stroke();

  // White card
  const pad = 70;
  const cardX = pad, cardY = 230, cardW = W - pad * 2, cardH = H - 230 - 190;
  ctx.fillStyle = '#FFFDF7';
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 40;
  ctx.beginPath(); roundRect(ctx, cardX, cardY, cardW, cardH, 40); ctx.fill();
  ctx.shadowBlur = 0;

  // Header: logo + church name
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath(); ctx.arc(W / 2, 100, 56, 0, Math.PI * 2); ctx.fill();
  drawCross(ctx, W / 2, 100, 64, '#FFFFFF');
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '700 40px Cinzel, serif';
  ctx.fillText('GOLDEN CITY CHURCH', W / 2, 200);

  // Author row inside the card
  const innerX = cardX + 60;
  const innerW = cardW - 120;
  const initial = (post.postedBy || 'G').trim().charAt(0).toUpperCase();
  ctx.fillStyle = '#C8960A';
  ctx.beginPath(); ctx.arc(innerX + 40, cardY + 95, 40, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 38px Inter, sans-serif';
  ctx.fillText(initial, innerX + 40, cardY + 109);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#3B2A00';
  ctx.font = '700 34px Inter, sans-serif';
  ctx.fillText(post.postedBy || 'Golden City', innerX + 100, cardY + 88);
  ctx.fillStyle = '#9A7209';
  ctx.font = '500 26px Inter, sans-serif';
  const date = new Date(post.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  ctx.fillText([post.postedByTitle, date].filter(Boolean).join('  ·  '), innerX + 100, cardY + 128);

  // Post text — shrink the font until it fits in the card
  const textTop    = cardY + 200;
  const textBottom = cardY + cardH - 60;
  const available = textBottom - textTop;
  let size = 58;
  let lines;
  for (;;) {
    ctx.font = `500 ${size}px Inter, sans-serif`;
    lines = wrapText(ctx, post.text || '', innerW);
    if (lines.length * size * 1.45 <= available || size <= 22) break;
    size -= 2;
  }
  const lineH = size * 1.45;
  const maxLines = Math.floor((textBottom - textTop) / lineH);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  ctx.fillStyle = '#1F1600';
  lines.forEach((l, i) => ctx.fillText(l, innerX, textTop + size + i * lineH));

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 30px Inter, sans-serif';
  ctx.fillText('CPM Golden City Church', W / 2, H - 100);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '500 24px Inter, sans-serif';
  ctx.fillText(window.location.host || 'goldencity', W / 2, H - 60);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png')
  );
};

// Returns 'shared' | 'downloaded' | 'cancelled'
export const sharePostAsImage = async (post) => {
  const blob = await renderPostImage(post);
  const file = new File([blob], 'golden-city-post.png', { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Post from ${post.postedBy}`,
        text:  'From CPM Golden City Church',
      });
      return 'shared';
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'; // user closed the share sheet
      // fall through to download
    }
  }

  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'golden-city-post.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
};
