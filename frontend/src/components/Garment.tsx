import React from "react";
import { COLORS } from "../lib/data";

export const ARM_L = "L35 60 L20 190 L40 195 L60 95";

export const SHAPES = {
  tee: {
    body: "M60 40 L85 30 Q100 45 115 30 L140 40 L172 72 L152 94 L140 84 L140 212 L60 212 L60 84 L48 94 L28 72 Z",
    lines: ["M85 30 Q100 45 115 30", "M60 84 L60 212", "M140 84 L140 212"],
    logo: true,
  },
  longsleeve: {
    body: "M60 40 L85 30 Q100 45 115 30 L140 40 L165 60 L180 190 L160 195 L140 95 L140 212 L60 212 L60 95 L40 195 L20 190 L35 60 Z",
    lines: ["M85 30 Q100 45 115 30", "M22 178 L42 182", "M178 178 L158 182", "M60 200 L140 200"],
    logo: true,
  },
  hoodie: {
    body: "M62 48 Q60 8 100 6 Q140 8 138 48 L165 60 L180 190 L160 195 L140 95 L140 212 L60 212 L60 95 L40 195 L20 190 L35 60 Z",
    dark: ["M78 46 Q78 20 100 20 Q122 20 122 46 Q112 60 100 60 Q88 60 78 46 Z"],
    lines: [
      "M72 150 L128 150 L136 186 L64 186 Z",
      "M92 60 L90 88",
      "M108 60 L110 88",
      "M60 200 L140 200",
      "M22 178 L42 182",
      "M178 178 L158 182",
    ],
    logo: true,
  },
  jacket: {
    body: "M72 24 L128 24 L134 40 L165 60 L180 190 L160 195 L140 95 L140 214 L60 214 L60 95 L40 195 L20 190 L35 60 L66 40 Z",
    lines: ["M100 26 L100 214", "M72 24 L76 42 L100 48 L124 42 L128 24", "M68 160 L88 160", "M112 160 L132 160"],
    reflect: [
      "M62 122 L96 104 L96 110 L62 128 Z",
      "M104 104 L138 122 L138 128 L104 110 Z",
      "M27 118 L39 113 L40 119 L28 124 Z",
      "M173 118 L161 113 L160 119 L172 124 Z",
    ],
  },
  vest: {
    body: "M70 28 L90 26 L100 58 L110 26 L130 28 L150 70 L146 212 L54 212 L50 70 Z",
    lines: ["M100 58 L100 212", "M58 110 L142 110", "M56 150 L144 150", "M66 172 L86 172", "M114 172 L134 172"],
  },
  cargo: {
    body: "M55 28 L145 28 L152 216 L110 216 L100 92 L90 216 L48 216 Z",
    lines: [
      "M55 42 L145 42",
      "M100 42 L100 92",
      "M54 112 L78 112 L80 152 L56 152 Z",
      "M146 112 L122 112 L120 152 L144 152 Z",
      "M50 200 L88 200",
      "M112 200 L150 200",
    ],
  },
  shorts: {
    body: "M55 62 L145 62 L156 162 L108 168 L100 112 L92 168 L44 162 Z",
    lines: ["M55 76 L145 76", "M100 76 L100 112", "M72 76 Q72 100 60 104", "M128 76 Q128 100 140 104"],
  },
  cap: {
    body: "M45 140 Q46 72 100 66 Q154 72 155 140 Z",
    brim: "M38 138 Q100 152 162 138 L178 160 Q100 182 22 160 Z",
    lines: ["M100 66 L100 140", "M72 74 Q78 106 74 140", "M128 74 Q122 106 126 140"],
    button: true,
    logoAt: [100, 118],
  },

  /* ---- Shirts & tank ---- */
  shirt: {
    body: "M70 30 L86 24 L100 34 L114 24 L130 30 L165 58 L180 190 L160 195 L141 96 L141 214 L59 214 L59 96 L40 195 L20 190 L35 58 Z",
    lines: [
      "M86 24 L92 48 L100 34", "M114 24 L108 48 L100 34", "M100 34 L100 214",
      "M112 70 L132 70 L132 94 L112 94 Z", "M22 176 L42 181", "M178 176 L158 181",
    ],
    dots: [[100, 62], [100, 92], [100, 122], [100, 152], [100, 182]],
  },
  "shirt-ss": {
    body: "M70 30 L86 24 L100 34 L114 24 L130 30 L170 64 L152 92 L141 82 L141 214 L59 214 L59 82 L48 92 L30 64 Z",
    lines: [
      "M86 24 L92 48 L100 34", "M114 24 L108 48 L100 34", "M100 34 L100 214",
      "M112 70 L132 70 L132 94 L112 94 Z", "M150 86 L164 68", "M50 86 L36 68",
    ],
    dots: [[100, 62], [100, 92], [100, 122], [100, 152], [100, 182]],
  },
  tank: {
    body: "M74 26 L86 26 Q100 52 114 26 L126 26 Q128 64 146 76 L146 214 L54 214 L54 76 Q72 64 74 26 Z",
    lines: ["M86 26 Q100 52 114 26", "M54 202 L146 202"],
    logo: true,
  },

  /* ---- Bottoms ---- */
  jeans: {
    body: "M58 28 L142 28 L148 216 L108 216 L100 96 L92 216 L52 216 Z",
    lines: [
      "M58 40 L142 40", "M70 28 L70 40", "M130 28 L130 40", "M100 28 L100 40",
      "M104 42 L104 80 Q104 90 97 94", "M60 46 Q78 50 82 66", "M140 46 Q122 50 118 66",
      "M53 206 L91 206", "M109 206 L147 206",
    ],
  },
  slacks: {
    body: "M58 28 L142 28 L146 216 L108 216 L100 98 L92 216 L54 216 Z",
    lines: [
      "M58 38 L142 38", "M78 40 L73 216", "M122 40 L127 216",
      "M86 38 L88 60", "M114 38 L112 60", "M60 44 L68 74", "M140 44 L132 74",
    ],
    dots: [[104, 33]],
  },

  /* ---- Footwear ---- */
  shoes: {
    body: "M22 196 L22 168 Q24 146 48 140 L86 128 Q98 112 116 116 L136 132 Q160 140 176 156 Q184 166 182 196 Z",
    lines: [
      "M92 128 L106 142", "M100 122 L114 138", "M108 118 L122 134",
      "M116 116 Q128 120 136 132", "M22 178 Q44 172 62 178", "M64 150 L84 186", "M76 146 L96 186",
    ],
    reflect: ["M18 196 L184 196 L184 206 Q100 214 18 206 Z"], // sole
    shadow: [100, 214, 84],
  },

  /* ---- Accessories ---- */
  belt: {
    // Rolled-up belt: a ring (the hole is cut out with evenodd) with the buckle on top
    body: "M28 134 a72 72 0 1 0 144 0 a72 72 0 1 0 -144 0 Z M60 134 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0 Z",
    lines: ["M44 134 a56 56 0 1 0 112 0 a56 56 0 1 0 -112 0"],
    reflect: ["M82 50 L118 50 L118 80 L82 80 Z M88 56 L112 56 L112 74 L88 74 Z"],
    shadow: [100, 214, 70],
  },
  shades: {
    // Frame with the lens holes cut out, tinted lenses painted on top
    body:
      "M14 98 L96 92 L94 142 Q92 160 76 160 L38 160 Q18 160 16 142 Z M24 106 L88 101 L86 140 Q85 150 74 150 L40 150 Q27 150 26 140 Z " +
      "M186 98 L104 92 L106 142 Q108 160 124 160 L162 160 Q182 160 184 142 Z M176 106 L112 101 L114 140 Q115 150 126 150 L160 150 Q173 150 174 140 Z " +
      "M94 98 Q100 92 106 98 L106 106 Q100 100 94 106 Z",
    dark: [
      "M24 106 L88 101 L86 140 Q85 150 74 150 L40 150 Q27 150 26 140 Z",
      "M176 106 L112 101 L114 140 Q115 150 126 150 L160 150 Q173 150 174 140 Z",
    ],
    lines: ["M32 112 L50 110", "M168 112 L150 110"],
    shadow: [100, 186, 76],
  },
  round: {
    // Optical frame: clear lenses (holes) with a small highlight
    body:
      "M28 128 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0 Z M35 128 a27 27 0 1 0 54 0 a27 27 0 1 0 -54 0 Z " +
      "M104 128 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0 Z M111 128 a27 27 0 1 0 54 0 a27 27 0 1 0 -54 0 Z " +
      "M94 118 Q100 108 106 118 L106 124 Q100 116 94 124 Z",
    lines: ["M44 116 Q50 108 60 106", "M120 116 Q126 108 136 106"],
    shadow: [100, 184, 72],
  },
  aviator: {
    body:
      "M16 100 Q58 86 96 100 Q98 140 76 158 Q44 170 24 148 Q12 128 16 100 Z M22 104 Q58 93 90 104 Q91 136 72 151 Q46 161 30 144 Q19 127 22 104 Z " +
      "M184 100 Q142 86 104 100 Q102 140 124 158 Q156 170 176 148 Q188 128 184 100 Z M178 104 Q142 93 110 104 Q109 136 128 151 Q154 161 170 144 Q181 127 178 104 Z " +
      "M60 88 L140 88 L140 92 L60 92 Z M94 100 Q100 94 106 100 L106 103 Q100 98 94 103 Z",
    dark: [
      "M22 104 Q58 93 90 104 Q91 136 72 151 Q46 161 30 144 Q19 127 22 104 Z",
      "M178 104 Q142 93 110 104 Q109 136 128 151 Q154 161 170 144 Q181 127 178 104 Z",
    ],
    lines: ["M32 112 L52 108", "M168 112 L148 108"],
    shadow: [100, 184, 76],
  },
  tie: {
    body: "M88 28 L112 28 L106 52 L94 52 Z M94 54 L106 54 L124 186 L100 212 L76 186 Z",
    lines: ["M84 140 L118 104", "M80 172 L122 128", "M90 86 L108 68"],
    shadow: [100, 222, 40],
  },
  socks: {
    body: "M70 24 L118 24 L118 140 Q118 150 128 158 L160 178 Q178 190 168 204 Q158 216 140 210 L86 182 Q70 174 70 156 Z",
    lines: [
      "M70 40 L118 40", "M82 24 L82 40", "M94 24 L94 40", "M106 24 L106 40",
      "M70 150 Q84 170 102 172", "M150 182 Q140 196 146 210",
    ],
    logoAt: [94, 96],
    shadow: [116, 220, 66],
  },
};

export const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 140;
};

export function Garment({ type, color, className = "" }: any) {
  const s: any = SHAPES[type] ?? SHAPES.tee; // unknown type: draw a tee rather than crash
  const fill = COLORS[color] ?? "#777";
  const [shX, shY, shR] = s.shadow ?? [100, 228, 70]; // small items sit their shadow right under them
  const light = isLight(fill);
  const edge = light ? "rgba(0,0,0,.20)" : "rgba(255,255,255,.16)";
  const seam = light ? "rgba(0,0,0,.22)" : "rgba(255,255,255,.13)";
  const deep = light ? "rgba(0,0,0,.28)" : "rgba(0,0,0,.55)";
  const gid = "sh-" + type;
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={`${color} ${type}`}>
      <defs>
        <linearGradient id={gid} x1={0.15} y1={0} x2={0.85} y2={1}>
          <stop offset={0} stopColor="#fff" stopOpacity={light ? 0.18 : 0.1} />
          <stop offset={0.55} stopColor="#fff" stopOpacity={0} />
          <stop offset={1} stopColor="#000" stopOpacity={0.25} />
        </linearGradient>
      </defs>
      <ellipse cx={shX} cy={shY} rx={shR} ry={6} fill="#000" opacity={0.45} />
      {s.brim && <path d={s.brim} fill={fill} stroke={edge} strokeWidth={1.2} />}
      {/* evenodd: inner sub-paths cut holes (belt ring, glasses lenses). No effect on the simple outlines. */}
      <path d={s.body} fill={fill} fillRule="evenodd" stroke={edge} strokeWidth={1.2} strokeLinejoin="round" />
      {s.brim && <path d={s.brim} fill={`url(#${gid})`} />}
      <path d={s.body} fill={`url(#${gid})`} fillRule="evenodd" />
      {(s.dark || []).map((d, i) => (
        <path key={"d" + i} d={d} fill={deep} />
      ))}
      {(s.lines || []).map((d, i) => (
        <path key={"l" + i} d={d} fill="none" stroke={seam} strokeWidth={1.2} strokeLinecap="round" />
      ))}
      {(s.reflect || []).map((d, i) => (
        <path key={"r" + i} d={d} fill="#e9e7e2" fillRule="evenodd" opacity={0.88} />
      ))}
      {(s.dots || []).map(([x, y], i) => (
        <circle key={"b" + i} cx={x} cy={y} r={2.4} fill={seam} />
      ))}
      {s.button && <circle cx={100} cy={67} r={3} fill={seam} />}
      {(s.logo || s.logoAt) && (
        <text
          x={s.logoAt ? s.logoAt[0] : 122}
          y={s.logoAt ? s.logoAt[1] : 78}
          textAnchor="middle"
          fontFamily="Bebas Neue, Impact, sans-serif"
          fontSize={s.logoAt ? 13 : 9}
          fill={seam}
          letterSpacing={0.5}
        >
          VVRN
        </text>
      )}
    </svg>
  );
}

/* =========================================================
   ROUTER (hash based so back/forward works)
   ========================================================= */
