const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'public', 'sketches');
fs.mkdirSync(dir, { recursive: true });

function makeSVG(name, drawing) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#fdf6e3" rx="10"/>
  <g stroke="#4a3728" fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
  </g>
  <text x="100" y="188" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="#5c4033" font-style="italic">${name}</text>
</svg>`;
}

function bowlDrawing(contents) {
  return `    <path d="M55 85 Q55 138 100 142 Q145 138 145 85" stroke-width="2"/>
    <path d="M50 85 L150 85" stroke-width="2.5"/>
    <path d="M70 150 Q100 160 130 150" stroke-width="1.5"/>
    <path d="M82 72 Q80 58 84 48" stroke-width="1.2"/>
    <path d="M100 68 Q98 52 102 40" stroke-width="1.2"/>
    <path d="M118 72 Q116 58 120 48" stroke-width="1.2"/>
${contents}`;
}

const items = [
  // ===== CATEGORIES =====
  ['cat-seeds', 'Seeds', `    <path d="M75 50 L65 138 Q100 152 135 138 L125 50 Q100 40 75 50Z" stroke-width="2"/>
    <path d="M75 50 Q100 60 125 50" stroke-width="1.5"/>
    <ellipse cx="142" cy="142" rx="5" ry="3" stroke-width="1.2" transform="rotate(-20 142 142)"/>
    <ellipse cx="152" cy="136" rx="5" ry="3" stroke-width="1.2" transform="rotate(10 152 136)"/>
    <ellipse cx="148" cy="150" rx="4" ry="2.5" stroke-width="1.2"/>
    <ellipse cx="158" cy="148" rx="5" ry="3" stroke-width="1.2" transform="rotate(-30 158 148)"/>`],

  ['cat-dals', 'Dals & Lentils', `    <path d="M55 88 Q55 140 100 145 Q145 140 145 88" stroke-width="2"/>
    <path d="M50 88 L150 88" stroke-width="2.5"/>
    <path d="M70 152 Q100 162 130 152" stroke-width="1.5"/>
    <circle cx="75" cy="85" r="5" stroke-width="1.2"/>
    <circle cx="90" cy="83" r="5" stroke-width="1.2"/>
    <circle cx="105" cy="85" r="5" stroke-width="1.2"/>
    <circle cx="120" cy="83" r="5" stroke-width="1.2"/>
    <path d="M82 75 Q80 60 84 50" stroke-width="1.2"/>
    <path d="M100 72 Q98 55 102 42" stroke-width="1.2"/>
    <path d="M118 75 Q116 60 120 50" stroke-width="1.2"/>`],

  ['cat-nuts', 'Nuts & Dry Fruits', `    <ellipse cx="70" cy="95" rx="18" ry="10" stroke-width="1.5" transform="rotate(-15 70 95)"/>
    <path d="M110 70 Q128 75 124 92 Q120 105 108 100 Q98 92 102 80 Q106 70 110 70" stroke-width="1.5"/>
    <circle cx="95" cy="120" r="15" stroke-width="1.5"/>
    <path d="M85 112 Q95 125 105 112" stroke-width="1"/>
    <path d="M85 128 Q95 115 105 128" stroke-width="1"/>
    <ellipse cx="130" cy="115" rx="12" ry="8" stroke-width="1.5"/>
    <path d="M130 107 L130 123" stroke-width="1"/>`],

  ['cat-fruits', 'Fresh Fruits', `    <path d="M45 105 Q45 150 100 155 Q155 150 155 105" stroke-width="2"/>
    <path d="M40 105 L160 105" stroke-width="2"/>
    <path d="M55 118 L145 118 M60 132 L140 132" stroke-width="0.8"/>
    <circle cx="78" cy="82" r="18" stroke-width="1.5"/>
    <path d="M78 64 L78 58" stroke-width="1.5"/>
    <path d="M105 65 Q128 58 135 80" stroke-width="2"/>
    <circle cx="120" cy="85" r="15" stroke-width="1.5"/>`],

  ['cat-vegetables', 'Fresh Vegetables', `    <path d="M45 108 Q45 152 100 157 Q155 152 155 108" stroke-width="2"/>
    <path d="M40 108 L160 108" stroke-width="2"/>
    <path d="M55 122 L145 122 M60 136 L140 136" stroke-width="0.8"/>
    <path d="M62 98 L52 62 L72 98" stroke-width="1.5"/>
    <path d="M57 62 Q62 48 67 62" stroke-width="1.2"/>
    <circle cx="100" cy="85" r="18" stroke-width="1.5"/>
    <path d="M92 68 L100 72 L108 68" stroke-width="1.2"/>
    <circle cx="138" cy="80" r="10" stroke-width="1.5"/>
    <circle cx="130" cy="72" r="8" stroke-width="1.5"/>
    <circle cx="146" cy="72" r="8" stroke-width="1.5"/>
    <path d="M138 90 L138 102" stroke-width="1.5"/>`],

  ['cat-spices', 'Spices & Masala', `    <path d="M55 92 Q55 142 100 148 Q145 142 145 92" stroke-width="2"/>
    <ellipse cx="100" cy="92" rx="45" ry="14" stroke-width="2"/>
    <path d="M122 82 L155 48" stroke-width="3"/>
    <ellipse cx="158" cy="44" rx="8" ry="5" stroke-width="2" transform="rotate(-50 158 44)"/>
    <circle cx="85" cy="98" r="3" fill="#4a3728"/>
    <circle cx="100" cy="100" r="2.5" fill="#4a3728"/>
    <circle cx="112" cy="97" r="2" fill="#4a3728"/>
    <circle cx="95" cy="108" r="3" fill="#4a3728"/>`],

  // ===== SEEDS =====
  ['sunflower-seeds', 'Sunflower Seeds', `    <circle cx="100" cy="82" r="18" stroke-width="2"/>
    <ellipse cx="100" cy="55" rx="8" ry="12" stroke-width="1.5"/>
    <ellipse cx="120" cy="62" rx="8" ry="12" stroke-width="1.5" transform="rotate(40 120 62)"/>
    <ellipse cx="127" cy="82" rx="12" ry="8" stroke-width="1.5"/>
    <ellipse cx="120" cy="102" rx="8" ry="12" stroke-width="1.5" transform="rotate(-40 120 102)"/>
    <ellipse cx="100" cy="110" rx="8" ry="12" stroke-width="1.5"/>
    <ellipse cx="80" cy="102" rx="8" ry="12" stroke-width="1.5" transform="rotate(40 80 102)"/>
    <ellipse cx="73" cy="82" rx="12" ry="8" stroke-width="1.5"/>
    <ellipse cx="80" cy="62" rx="8" ry="12" stroke-width="1.5" transform="rotate(-40 80 62)"/>
    <path d="M100 122 L100 165" stroke-width="2"/>
    <path d="M100 142 Q118 132 116 152" stroke-width="1.5"/>
    <circle cx="94" cy="78" r="2" fill="#4a3728"/>
    <circle cx="100" cy="76" r="2" fill="#4a3728"/>
    <circle cx="106" cy="78" r="2" fill="#4a3728"/>
    <circle cx="96" cy="86" r="2" fill="#4a3728"/>
    <circle cx="104" cy="86" r="2" fill="#4a3728"/>`],

  ['pumpkin-seeds', 'Pumpkin Seeds', `    <path d="M100 48 Q62 52 58 90 Q52 128 100 138 Q148 128 142 90 Q138 52 100 48" stroke-width="2"/>
    <path d="M100 48 Q82 52 80 90 Q82 128 100 138" stroke-width="1"/>
    <path d="M100 48 Q118 52 120 90 Q118 128 100 138" stroke-width="1"/>
    <path d="M96 48 Q93 34 100 30 Q107 34 104 48" stroke-width="1.5"/>
    <ellipse cx="70" cy="158" rx="7" ry="4" stroke-width="1.2" transform="rotate(-15 70 158)"/>
    <ellipse cx="95" cy="160" rx="7" ry="4" stroke-width="1.2" transform="rotate(10 95 160)"/>
    <ellipse cx="120" cy="157" rx="7" ry="4" stroke-width="1.2" transform="rotate(-5 120 157)"/>`],

  ['chia-seeds', 'Chia Seeds', `    <ellipse cx="100" cy="78" rx="32" ry="18" stroke-width="2"/>
    <path d="M100 96 L100 162" stroke-width="2.5"/>
    <circle cx="85" cy="72" r="2" fill="#4a3728"/>
    <circle cx="92" cy="78" r="2" fill="#4a3728"/>
    <circle cx="100" cy="70" r="2" fill="#4a3728"/>
    <circle cx="108" cy="76" r="2" fill="#4a3728"/>
    <circle cx="95" cy="84" r="2" fill="#4a3728"/>
    <circle cx="105" cy="82" r="2" fill="#4a3728"/>
    <circle cx="115" cy="74" r="2" fill="#4a3728"/>
    <circle cx="88" cy="68" r="2" fill="#4a3728"/>
    <circle cx="50" cy="55" r="1.5" fill="#4a3728"/>
    <circle cx="60" cy="48" r="1.5" fill="#4a3728"/>
    <circle cx="142" cy="52" r="1.5" fill="#4a3728"/>
    <circle cx="148" cy="60" r="1.5" fill="#4a3728"/>`],

  ['flax-seeds', 'Flax Seeds', `    <ellipse cx="100" cy="118" rx="48" ry="14" stroke-width="2"/>
    <path d="M52 118 Q52 140 100 145 Q148 140 148 118" stroke-width="2"/>
    <ellipse cx="78" cy="112" rx="7" ry="3.5" stroke-width="1.2" transform="rotate(-20 78 112)"/>
    <ellipse cx="98" cy="110" rx="7" ry="3.5" stroke-width="1.2" transform="rotate(15 98 110)"/>
    <ellipse cx="118" cy="113" rx="7" ry="3.5" stroke-width="1.2" transform="rotate(-8 118 113)"/>
    <ellipse cx="88" cy="120" rx="7" ry="3.5" stroke-width="1.2" transform="rotate(5 88 120)"/>
    <ellipse cx="112" cy="118" rx="7" ry="3.5" stroke-width="1.2" transform="rotate(-22 112 118)"/>
    <path d="M100 90 L100 48" stroke-width="1.5"/>
    <path d="M100 65 Q85 55 82 62" stroke-width="1.2"/>
    <path d="M100 58 Q115 48 118 55" stroke-width="1.2"/>`],

  ['sesame-seeds', 'Sesame Seeds', `    <rect x="65" y="42" width="70" height="120" rx="8" stroke-width="2"/>
    <path d="M65 58 L135 58" stroke-width="1.5"/>
    <path d="M85 42 L85 58 M115 42 L115 58" stroke-width="1.2"/>
    <ellipse cx="82" cy="75" rx="5" ry="3" stroke-width="1.2" transform="rotate(-25 82 75)"/>
    <ellipse cx="100" cy="72" rx="5" ry="3" stroke-width="1.2" transform="rotate(15 100 72)"/>
    <ellipse cx="118" cy="76" rx="5" ry="3" stroke-width="1.2" transform="rotate(-10 118 76)"/>
    <ellipse cx="85" cy="95" rx="5" ry="3" stroke-width="1.2" transform="rotate(20 85 95)"/>
    <ellipse cx="105" cy="92" rx="5" ry="3" stroke-width="1.2" transform="rotate(-5 105 92)"/>
    <ellipse cx="90" cy="112" rx="5" ry="3" stroke-width="1.2" transform="rotate(10 90 112)"/>
    <ellipse cx="112" cy="110" rx="5" ry="3" stroke-width="1.2" transform="rotate(-18 112 110)"/>
    <ellipse cx="98" cy="130" rx="5" ry="3" stroke-width="1.2" transform="rotate(8 98 130)"/>
    <ellipse cx="118" cy="128" rx="5" ry="3" stroke-width="1.2" transform="rotate(22 118 128)"/>`],

  ['watermelon-seeds', 'Watermelon Seeds', `    <path d="M50 115 Q50 55 100 50 Q150 55 150 115 Z" stroke-width="2"/>
    <path d="M50 115 L150 115" stroke-width="2.5"/>
    <path d="M56 108 Q56 62 100 58 Q144 62 144 108" stroke-width="1" stroke-dasharray="3 4"/>
    <ellipse cx="80" cy="82" rx="4" ry="6" fill="#4a3728" transform="rotate(-15 80 82)"/>
    <ellipse cx="100" cy="78" rx="4" ry="6" fill="#4a3728"/>
    <ellipse cx="120" cy="82" rx="4" ry="6" fill="#4a3728" transform="rotate(15 120 82)"/>
    <ellipse cx="88" cy="100" rx="4" ry="6" fill="#4a3728" transform="rotate(-10 88 100)"/>
    <ellipse cx="112" cy="100" rx="4" ry="6" fill="#4a3728" transform="rotate(10 112 100)"/>`],

  ['basil-seeds', 'Basil Seeds', `    <path d="M90 50 Q70 70 72 95 Q75 110 90 110 Q100 105 100 90 Q100 70 90 50" stroke-width="2"/>
    <path d="M110 50 Q130 70 128 95 Q125 110 110 110 Q100 105 100 90 Q100 70 110 50" stroke-width="2"/>
    <path d="M100 48 L100 30" stroke-width="2"/>
    <path d="M90 80 Q100 75 110 80" stroke-width="1"/>
    <path d="M85 90 Q100 85 115 90" stroke-width="1"/>
    <circle cx="72" cy="130" r="2.5" fill="#4a3728"/>
    <circle cx="82" cy="135" r="2.5" fill="#4a3728"/>
    <circle cx="92" cy="132" r="2" fill="#4a3728"/>
    <circle cx="100" cy="138" r="2.5" fill="#4a3728"/>
    <circle cx="110" cy="134" r="2" fill="#4a3728"/>
    <circle cx="120" cy="130" r="2.5" fill="#4a3728"/>
    <circle cx="128" cy="136" r="2" fill="#4a3728"/>`],

  ['hemp-seeds', 'Hemp Seeds', `    <path d="M100 35 L100 55" stroke-width="2"/>
    <path d="M100 55 L80 85 M100 55 L120 85 M100 55 L65 72 M100 55 L135 72 M100 55 L100 90" stroke-width="1.5"/>
    <path d="M80 85 Q68 82 65 72" stroke-width="1.2"/>
    <path d="M120 85 Q132 82 135 72" stroke-width="1.2"/>
    <circle cx="70" cy="115" r="4" stroke-width="1.2"/>
    <circle cx="88" cy="120" r="4" stroke-width="1.2"/>
    <circle cx="105" cy="116" r="4" stroke-width="1.2"/>
    <circle cx="122" cy="122" r="4" stroke-width="1.2"/>
    <circle cx="80" cy="138" r="4" stroke-width="1.2"/>
    <circle cx="98" cy="140" r="4" stroke-width="1.2"/>
    <circle cx="115" cy="136" r="4" stroke-width="1.2"/>`],

  // ===== DALS =====
  ['toor-dal', 'Toor Dal', bowlDrawing(`    <circle cx="72" cy="82" r="5" stroke-width="1.2"/>
    <circle cx="86" cy="80" r="5" stroke-width="1.2"/>
    <circle cx="100" cy="82" r="5" stroke-width="1.2"/>
    <circle cx="114" cy="80" r="5" stroke-width="1.2"/>
    <circle cx="128" cy="82" r="5" stroke-width="1.2"/>
    <circle cx="80" cy="92" r="5" stroke-width="1.2"/>
    <circle cx="95" cy="94" r="5" stroke-width="1.2"/>
    <circle cx="110" cy="92" r="5" stroke-width="1.2"/>`)],

  ['moong-dal', 'Moong Dal', bowlDrawing(`    <ellipse cx="72" cy="82" rx="6" ry="4" stroke-width="1.2"/>
    <path d="M72 78 L72 86" stroke-width="0.8"/>
    <ellipse cx="88" cy="80" rx="6" ry="4" stroke-width="1.2"/>
    <path d="M88 76 L88 84" stroke-width="0.8"/>
    <ellipse cx="104" cy="82" rx="6" ry="4" stroke-width="1.2"/>
    <path d="M104 78 L104 86" stroke-width="0.8"/>
    <ellipse cx="120" cy="80" rx="6" ry="4" stroke-width="1.2"/>
    <path d="M120 76 L120 84" stroke-width="0.8"/>
    <ellipse cx="80" cy="92" rx="6" ry="4" stroke-width="1.2"/>
    <ellipse cx="96" cy="94" rx="6" ry="4" stroke-width="1.2"/>
    <ellipse cx="112" cy="92" rx="6" ry="4" stroke-width="1.2"/>`)],

  ['masoor-dal', 'Masoor Dal', bowlDrawing(`    <circle cx="72" cy="82" r="4" stroke-width="1.2"/>
    <circle cx="84" cy="80" r="4" stroke-width="1.2"/>
    <circle cx="96" cy="82" r="4" stroke-width="1.2"/>
    <circle cx="108" cy="80" r="4" stroke-width="1.2"/>
    <circle cx="120" cy="82" r="4" stroke-width="1.2"/>
    <circle cx="132" cy="83" r="4" stroke-width="1.2"/>
    <circle cx="78" cy="90" r="4" stroke-width="1.2"/>
    <circle cx="90" cy="92" r="4" stroke-width="1.2"/>
    <circle cx="102" cy="90" r="4" stroke-width="1.2"/>
    <circle cx="114" cy="92" r="4" stroke-width="1.2"/>`)],

  ['chana-dal', 'Chana Dal', bowlDrawing(`    <circle cx="72" cy="80" r="7" stroke-width="1.2"/>
    <path d="M65 80 L79 80" stroke-width="0.8"/>
    <circle cx="90" cy="82" r="7" stroke-width="1.2"/>
    <path d="M83 82 L97 82" stroke-width="0.8"/>
    <circle cx="108" cy="80" r="7" stroke-width="1.2"/>
    <path d="M101 80 L115 80" stroke-width="0.8"/>
    <circle cx="126" cy="82" r="7" stroke-width="1.2"/>
    <path d="M119 82 L133 82" stroke-width="0.8"/>
    <circle cx="82" cy="94" r="6" stroke-width="1.2"/>
    <circle cx="100" cy="96" r="6" stroke-width="1.2"/>
    <circle cx="118" cy="94" r="6" stroke-width="1.2"/>`)],

  ['urad-dal', 'Urad Dal', bowlDrawing(`    <circle cx="72" cy="82" r="5" stroke-width="1.5" fill="#4a3728" opacity="0.4"/>
    <circle cx="86" cy="80" r="5" stroke-width="1.5" fill="#4a3728" opacity="0.4"/>
    <circle cx="100" cy="82" r="5" stroke-width="1.5" fill="#4a3728" opacity="0.4"/>
    <circle cx="114" cy="80" r="5" stroke-width="1.5" fill="#4a3728" opacity="0.4"/>
    <circle cx="128" cy="82" r="5" stroke-width="1.5" fill="#4a3728" opacity="0.4"/>
    <circle cx="80" cy="92" r="5" stroke-width="1.5" fill="#4a3728" opacity="0.4"/>
    <circle cx="95" cy="94" r="5" stroke-width="1.5" fill="#4a3728" opacity="0.4"/>
    <circle cx="110" cy="92" r="5" stroke-width="1.5" fill="#4a3728" opacity="0.4"/>`)],

  ['rajma', 'Rajma', `    <path d="M60 65 Q50 72 50 82 Q50 92 60 95 Q66 95 68 88 Q70 82 68 76 Q66 68 60 65" stroke-width="1.5"/>
    <path d="M85 72 Q75 78 75 88 Q75 98 85 100 Q90 100 92 94 Q94 88 92 82 Q90 76 85 72" stroke-width="1.5"/>
    <path d="M115 65 Q105 72 105 82 Q105 92 115 95 Q120 95 122 88 Q124 82 122 76 Q120 68 115 65" stroke-width="1.5"/>
    <path d="M140 72 Q130 78 130 88 Q130 98 140 100 Q145 100 147 94 Q149 88 147 82 Q145 76 140 72" stroke-width="1.5"/>
    <path d="M72 110 Q62 116 62 126 Q62 136 72 138 Q78 138 80 132 Q82 126 80 120 Q78 114 72 110" stroke-width="1.5"/>
    <path d="M100 115 Q90 122 90 132 Q90 142 100 145 Q106 145 108 138 Q110 132 108 126 Q106 118 100 115" stroke-width="1.5"/>
    <path d="M128 110 Q118 116 118 126 Q118 136 128 138 Q134 138 136 132 Q138 126 136 120 Q134 114 128 110" stroke-width="1.5"/>`],

  ['kabuli-chana', 'Kabuli Chana', `    <circle cx="65" cy="70" r="12" stroke-width="1.5"/>
    <path d="M60 62 Q65 58 70 62" stroke-width="1"/>
    <circle cx="105" cy="68" r="12" stroke-width="1.5"/>
    <path d="M100 60 Q105 56 110 60" stroke-width="1"/>
    <circle cx="140" cy="72" r="12" stroke-width="1.5"/>
    <path d="M135 64 Q140 60 145 64" stroke-width="1"/>
    <circle cx="78" cy="105" r="12" stroke-width="1.5"/>
    <path d="M73 97 Q78 93 83 97" stroke-width="1"/>
    <circle cx="118" cy="102" r="12" stroke-width="1.5"/>
    <path d="M113 94 Q118 90 123 94" stroke-width="1"/>
    <circle cx="95" cy="138" r="12" stroke-width="1.5"/>
    <path d="M90 130 Q95 126 100 130" stroke-width="1"/>`],

  ['lobia', 'Lobia', `    <ellipse cx="62" cy="68" rx="14" ry="10" stroke-width="1.5"/>
    <circle cx="56" cy="68" r="3" fill="#4a3728" opacity="0.5"/>
    <ellipse cx="108" cy="65" rx="14" ry="10" stroke-width="1.5"/>
    <circle cx="102" cy="65" r="3" fill="#4a3728" opacity="0.5"/>
    <ellipse cx="148" cy="70" rx="14" ry="10" stroke-width="1.5"/>
    <circle cx="142" cy="70" r="3" fill="#4a3728" opacity="0.5"/>
    <ellipse cx="75" cy="105" rx="14" ry="10" stroke-width="1.5"/>
    <circle cx="69" cy="105" r="3" fill="#4a3728" opacity="0.5"/>
    <ellipse cx="120" cy="102" rx="14" ry="10" stroke-width="1.5"/>
    <circle cx="114" cy="102" r="3" fill="#4a3728" opacity="0.5"/>
    <ellipse cx="90" cy="138" rx="14" ry="10" stroke-width="1.5"/>
    <circle cx="84" cy="138" r="3" fill="#4a3728" opacity="0.5"/>`],

  // ===== NUTS =====
  ['almonds', 'Almonds', `    <path d="M70 60 Q55 80 60 105 Q65 120 80 120 Q90 115 88 95 Q86 75 70 60" stroke-width="2"/>
    <path d="M62 90 Q75 85 85 95" stroke-width="1"/>
    <path d="M120 55 Q105 75 110 100 Q115 115 130 115 Q140 110 138 90 Q136 70 120 55" stroke-width="2"/>
    <path d="M112 85 Q125 80 135 90" stroke-width="1"/>
    <path d="M95 110 Q80 130 85 155 Q90 168 105 168 Q115 163 113 143 Q111 125 95 110" stroke-width="2"/>
    <path d="M87 140 Q100 135 110 143" stroke-width="1"/>`],

  ['cashews', 'Cashews', `    <path d="M75 55 Q95 50 100 65 Q105 80 95 90 Q85 100 70 95 Q60 85 65 70 Q68 58 75 55" stroke-width="2"/>
    <path d="M100 65 Q95 75 95 90" stroke-width="1"/>
    <path d="M125 60 Q145 55 150 70 Q155 85 145 95 Q135 105 120 100 Q110 90 115 75 Q118 63 125 60" stroke-width="2"/>
    <path d="M150 70 Q145 80 145 95" stroke-width="1"/>
    <path d="M90 115 Q110 110 115 125 Q120 140 110 150 Q100 160 85 155 Q75 145 80 130 Q83 118 90 115" stroke-width="2"/>
    <path d="M115 125 Q110 135 110 150" stroke-width="1"/>`],

  ['walnuts', 'Walnuts', `    <circle cx="100" cy="90" r="38" stroke-width="2"/>
    <circle cx="100" cy="90" r="32" stroke-width="1.2"/>
    <path d="M100 58 L100 122" stroke-width="1.5"/>
    <path d="M75 68 Q100 85 125 68" stroke-width="1.2"/>
    <path d="M72 90 Q100 105 128 90" stroke-width="1.2"/>
    <path d="M75 112 Q100 95 125 112" stroke-width="1.2"/>
    <path d="M80 75 Q88 85 80 95" stroke-width="0.8"/>
    <path d="M120 75 Q112 85 120 95" stroke-width="0.8"/>`],

  ['pistachios', 'Pistachios', `    <ellipse cx="72" cy="78" rx="16" ry="22" stroke-width="2"/>
    <path d="M58 68 Q72 55 86 68" stroke-width="1.5"/>
    <circle cx="72" cy="82" r="6" fill="#4a3728" opacity="0.3"/>
    <ellipse cx="128" cy="75" rx="16" ry="22" stroke-width="2"/>
    <path d="M114 65 Q128 52 142 65" stroke-width="1.5"/>
    <circle cx="128" cy="79" r="6" fill="#4a3728" opacity="0.3"/>
    <ellipse cx="95" cy="130" rx="16" ry="22" stroke-width="2"/>
    <path d="M81 120 Q95 107 109 120" stroke-width="1.5"/>
    <circle cx="95" cy="134" r="6" fill="#4a3728" opacity="0.3"/>`],

  ['peanuts', 'Peanuts', `    <path d="M65 50 Q55 58 55 70 Q55 80 65 82 Q72 82 74 72 Q76 68 74 62 Q72 54 65 50" stroke-width="2"/>
    <path d="M65 82 Q55 88 55 100 Q55 110 65 112 Q72 112 74 102 Q76 98 74 92 Q72 86 65 82" stroke-width="2"/>
    <path d="M110 55 Q100 62 100 74 Q100 84 110 86 Q118 86 120 76 Q122 72 120 66 Q118 58 110 55" stroke-width="2"/>
    <path d="M110 86 Q100 92 100 104 Q100 114 110 116 Q118 116 120 106 Q122 102 120 96 Q118 90 110 86" stroke-width="2"/>
    <path d="M88 110 Q78 118 78 130 Q78 140 88 142 Q96 142 98 132 Q100 128 98 122 Q96 114 88 110" stroke-width="2"/>
    <path d="M88 142 Q78 148 78 160 Q78 168 88 170 Q96 170 98 160 Q100 156 98 150 Q96 144 88 142" stroke-width="2"/>`],

  ['raisins', 'Raisins', `    <path d="M60 68 Q55 62 58 55 Q62 52 68 56 Q72 62 68 70 Q64 74 60 68" stroke-width="1.5" fill="#4a3728" opacity="0.3"/>
    <path d="M90 62 Q85 56 88 50 Q92 47 98 52 Q102 58 98 65 Q94 68 90 62" stroke-width="1.5" fill="#4a3728" opacity="0.3"/>
    <path d="M120 65 Q115 59 118 53 Q122 50 128 55 Q132 61 128 68 Q124 72 120 65" stroke-width="1.5" fill="#4a3728" opacity="0.3"/>
    <path d="M72 98 Q67 92 70 86 Q74 83 80 88 Q84 94 80 100 Q76 104 72 98" stroke-width="1.5" fill="#4a3728" opacity="0.3"/>
    <path d="M105 95 Q100 89 103 83 Q107 80 113 85 Q117 91 113 98 Q109 102 105 95" stroke-width="1.5" fill="#4a3728" opacity="0.3"/>
    <path d="M140 92 Q135 86 138 80 Q142 77 148 82 Q152 88 148 95 Q144 99 140 92" stroke-width="1.5" fill="#4a3728" opacity="0.3"/>
    <path d="M85 128 Q80 122 83 116 Q87 113 93 118 Q97 124 93 130 Q89 134 85 128" stroke-width="1.5" fill="#4a3728" opacity="0.3"/>
    <path d="M118 125 Q113 119 116 113 Q120 110 126 115 Q130 121 126 128 Q122 132 118 125" stroke-width="1.5" fill="#4a3728" opacity="0.3"/>`],

  ['dates', 'Dates', `    <ellipse cx="65" cy="72" rx="10" ry="22" stroke-width="2" transform="rotate(-10 65 72)"/>
    <path d="M58 58 Q65 52 72 58" stroke-width="1"/>
    <ellipse cx="100" cy="68" rx="10" ry="22" stroke-width="2" transform="rotate(5 100 68)"/>
    <path d="M93 52 Q100 46 107 52" stroke-width="1"/>
    <ellipse cx="135" cy="74" rx="10" ry="22" stroke-width="2" transform="rotate(-5 135 74)"/>
    <path d="M128 58 Q135 52 142 58" stroke-width="1"/>
    <ellipse cx="80" cy="125" rx="10" ry="22" stroke-width="2" transform="rotate(8 80 125)"/>
    <path d="M73 109 Q80 103 87 109" stroke-width="1"/>
    <ellipse cx="118" cy="122" rx="10" ry="22" stroke-width="2" transform="rotate(-8 118 122)"/>
    <path d="M111 106 Q118 100 125 106" stroke-width="1"/>`],

  ['dried-figs', 'Dried Figs', `    <circle cx="72" cy="80" r="22" stroke-width="2"/>
    <path d="M72 58 L72 102" stroke-width="1"/>
    <path d="M50 80 L94 80" stroke-width="1"/>
    <path d="M56 65 L88 95" stroke-width="0.8"/>
    <path d="M56 95 L88 65" stroke-width="0.8"/>
    <path d="M72 58 Q72 50 78 48" stroke-width="1.5"/>
    <circle cx="130" cy="105" r="22" stroke-width="2"/>
    <path d="M130 83 L130 127" stroke-width="1"/>
    <path d="M108 105 L152 105" stroke-width="1"/>
    <path d="M114 90 L146 120" stroke-width="0.8"/>
    <path d="M114 120 L146 90" stroke-width="0.8"/>
    <path d="M130 83 Q130 75 136 73" stroke-width="1.5"/>`],

  // ===== FRUITS =====
  ['apple', 'Apple', `    <circle cx="100" cy="92" r="40" stroke-width="2"/>
    <path d="M95 54 Q100 60 105 54" stroke-width="1.5"/>
    <path d="M100 54 L100 38" stroke-width="2"/>
    <path d="M100 42 Q112 35 115 45" stroke-width="1.5"/>
    <path d="M85 82 Q88 77 92 82" stroke-width="0.8"/>
    <path d="M108 82 Q111 77 114 82" stroke-width="0.8"/>`],

  ['banana', 'Banana', `    <path d="M55 130 Q40 85 65 50 Q80 35 95 42 Q88 60 90 90 Q92 120 85 135 Q72 142 55 130" stroke-width="2"/>
    <path d="M95 42 L100 38" stroke-width="2"/>
    <path d="M60 130 Q48 90 70 55" stroke-width="1"/>
    <path d="M118 125 Q105 80 128 48 Q142 32 158 40 Q150 58 152 88 Q154 118 148 132 Q135 140 118 125" stroke-width="2"/>
    <path d="M158 40 L162 35" stroke-width="2"/>
    <path d="M123 125 Q112 85 132 52" stroke-width="1"/>`],

  ['orange', 'Orange', `    <circle cx="100" cy="92" r="40" stroke-width="2"/>
    <circle cx="100" cy="92" r="34" stroke-width="0.6" stroke-dasharray="2 4"/>
    <path d="M100 52 L100 45" stroke-width="2.5"/>
    <path d="M100 48 Q112 42 116 50" stroke-width="1.5"/>
    <path d="M116 50 Q120 58 115 60" stroke-width="1.2"/>`],

  ['strawberry', 'Strawberry', `    <path d="M100 42 Q135 72 125 108 Q115 138 100 142 Q85 138 75 108 Q65 72 100 42" stroke-width="2"/>
    <path d="M82 40 Q92 30 100 36 Q108 30 118 40" stroke-width="1.5"/>
    <path d="M88 35 Q90 25 94 30" stroke-width="1.2"/>
    <path d="M112 35 Q110 25 106 30" stroke-width="1.2"/>
    <circle cx="92" cy="75" r="2" fill="#4a3728"/>
    <circle cx="108" cy="78" r="2" fill="#4a3728"/>
    <circle cx="88" cy="95" r="2" fill="#4a3728"/>
    <circle cx="112" cy="98" r="2" fill="#4a3728"/>
    <circle cx="95" cy="115" r="2" fill="#4a3728"/>
    <circle cx="105" cy="118" r="2" fill="#4a3728"/>
    <circle cx="100" cy="132" r="2" fill="#4a3728"/>`],

  ['mango', 'Mango', `    <ellipse cx="100" cy="92" rx="35" ry="45" stroke-width="2" transform="rotate(-15 100 92)"/>
    <path d="M108 48 Q105 35 110 28" stroke-width="2"/>
    <path d="M90 60 Q95 55 105 58" stroke-width="1"/>
    <path d="M85 75 Q95 70 108 72" stroke-width="0.8"/>`],

  ['grapes', 'Grapes', `    <circle cx="88" cy="68" r="12" stroke-width="1.5"/>
    <circle cx="112" cy="68" r="12" stroke-width="1.5"/>
    <circle cx="78" cy="88" r="12" stroke-width="1.5"/>
    <circle cx="100" cy="85" r="12" stroke-width="1.5"/>
    <circle cx="122" cy="88" r="12" stroke-width="1.5"/>
    <circle cx="85" cy="108" r="12" stroke-width="1.5"/>
    <circle cx="108" cy="106" r="12" stroke-width="1.5"/>
    <circle cx="95" cy="124" r="12" stroke-width="1.5"/>
    <path d="M100 56 L100 35 Q108 28 118 35" stroke-width="1.5"/>
    <path d="M118 35 Q122 42 118 48" stroke-width="1.2"/>`],

  ['pineapple', 'Pineapple', `    <ellipse cx="100" cy="102" rx="32" ry="50" stroke-width="2"/>
    <path d="M72 78 L128 126 M72 92 L128 112 M72 106 L128 98 M72 120 L128 84" stroke-width="0.8"/>
    <path d="M68 102 L132 102 M70 88 L130 116 M70 116 L130 88" stroke-width="0.8"/>
    <path d="M92 52 L86 28 M96 50 L92 22 M100 48 L100 18 M104 50 L108 22 M108 52 L114 28" stroke-width="1.5"/>`],

  ['watermelon-fruit', 'Watermelon', `    <path d="M50 112 Q50 52 100 48 Q150 52 150 112 Z" stroke-width="2"/>
    <path d="M50 112 L150 112" stroke-width="2.5"/>
    <path d="M56 106 Q56 60 100 56 Q144 60 144 106" stroke-width="1" stroke-dasharray="3 4"/>
    <circle cx="80" cy="80" r="3" fill="#4a3728"/>
    <circle cx="100" cy="75" r="3" fill="#4a3728"/>
    <circle cx="120" cy="80" r="3" fill="#4a3728"/>
    <circle cx="88" cy="96" r="3" fill="#4a3728"/>
    <circle cx="112" cy="96" r="3" fill="#4a3728"/>`],

  // ===== VEGETABLES =====
  ['tomato', 'Tomato', `    <circle cx="100" cy="92" r="38" stroke-width="2"/>
    <path d="M78 58 L88 65 L100 56 L112 65 L122 58" stroke-width="1.5"/>
    <path d="M100 56 L100 42" stroke-width="1.5"/>
    <path d="M75 85 Q100 78 125 85" stroke-width="0.8"/>
    <path d="M72 95 Q100 102 128 95" stroke-width="0.8"/>`],

  ['onion', 'Onion', `    <path d="M100 40 Q60 65 58 100 Q55 140 100 150 Q145 140 142 100 Q140 65 100 40" stroke-width="2"/>
    <path d="M100 40 Q80 65 78 100 Q76 135 100 150" stroke-width="1"/>
    <path d="M100 40 Q120 65 122 100 Q124 135 100 150" stroke-width="1"/>
    <path d="M100 40 L100 25" stroke-width="2"/>
    <path d="M95 28 Q100 20 105 28" stroke-width="1.2"/>
    <path d="M75 155 Q90 160 80 168 M100 152 L100 165 M125 155 Q110 160 120 168" stroke-width="1.2"/>`],

  ['potato', 'Potato', `    <ellipse cx="100" cy="92" rx="48" ry="35" stroke-width="2"/>
    <path d="M75 80 Q78 78 80 80" stroke-width="1.5"/>
    <path d="M110 78 Q113 76 115 78" stroke-width="1.5"/>
    <path d="M90 100 Q93 98 95 100" stroke-width="1.5"/>
    <path d="M125 90 Q128 88 130 90" stroke-width="1.5"/>
    <path d="M68 92 Q71 90 73 92" stroke-width="1.5"/>`],

  ['carrot', 'Carrot', `    <path d="M85 45 L75 155 Q100 165 105 155 L95 45 Z" stroke-width="2"/>
    <path d="M80 70 Q90 65 100 70" stroke-width="0.8"/>
    <path d="M78 95 Q90 90 102 95" stroke-width="0.8"/>
    <path d="M77 120 Q90 115 101 120" stroke-width="0.8"/>
    <path d="M90 45 Q80 25 70 28" stroke-width="1.5"/>
    <path d="M90 45 Q85 22 90 18" stroke-width="1.5"/>
    <path d="M90 45 Q95 25 105 22" stroke-width="1.5"/>
    <path d="M90 45 Q100 28 112 30" stroke-width="1.5"/>`],

  ['broccoli', 'Broccoli', `    <circle cx="100" cy="62" r="18" stroke-width="2"/>
    <circle cx="78" cy="72" r="15" stroke-width="2"/>
    <circle cx="122" cy="72" r="15" stroke-width="2"/>
    <circle cx="85" cy="52" r="12" stroke-width="2"/>
    <circle cx="115" cy="52" r="12" stroke-width="2"/>
    <circle cx="100" cy="45" r="10" stroke-width="2"/>
    <path d="M92 85 L88 155" stroke-width="3"/>
    <path d="M108 85 L112 155" stroke-width="3"/>
    <path d="M88 155 Q100 162 112 155" stroke-width="2"/>`],

  ['spinach', 'Spinach', `    <path d="M100 160 L95 90" stroke-width="2"/>
    <path d="M95 90 Q70 70 65 80 Q55 95 72 100 Q85 100 95 90" stroke-width="2"/>
    <path d="M95 100 Q65 85 60 100 Q52 118 70 120 Q82 118 95 105" stroke-width="2"/>
    <path d="M100 160 L105 95" stroke-width="2"/>
    <path d="M105 95 Q130 75 135 85 Q145 100 128 105 Q115 105 105 95" stroke-width="2"/>
    <path d="M105 108 Q135 92 140 105 Q148 122 130 125 Q118 122 105 112" stroke-width="2"/>
    <path d="M80 82 Q95 88 90 95" stroke-width="0.8"/>
    <path d="M120 88 Q108 92 110 100" stroke-width="0.8"/>`],

  ['bell-pepper', 'Bell Pepper', `    <path d="M100 45 Q70 55 62 85 Q55 120 68 145 Q80 162 100 165 Q120 162 132 145 Q145 120 138 85 Q130 55 100 45" stroke-width="2"/>
    <path d="M100 45 Q85 55 82 85 Q80 115 100 165" stroke-width="1"/>
    <path d="M100 45 Q115 55 118 85 Q120 115 100 165" stroke-width="1"/>
    <path d="M96 45 Q94 32 98 26 Q102 32 100 45" stroke-width="1.5"/>
    <path d="M98 26 L98 18" stroke-width="2"/>`],

  ['cucumber', 'Cucumber', `    <rect x="62" y="55" width="76" height="95" rx="38" stroke-width="2"/>
    <path d="M100 55 L100 48 Q102 42 106 45" stroke-width="1.5"/>
    <circle cx="82" cy="78" r="2" fill="#4a3728" opacity="0.3"/>
    <circle cx="100" cy="75" r="2" fill="#4a3728" opacity="0.3"/>
    <circle cx="118" cy="80" r="2" fill="#4a3728" opacity="0.3"/>
    <circle cx="88" cy="98" r="2" fill="#4a3728" opacity="0.3"/>
    <circle cx="112" cy="102" r="2" fill="#4a3728" opacity="0.3"/>
    <circle cx="78" cy="118" r="2" fill="#4a3728" opacity="0.3"/>
    <circle cx="100" cy="120" r="2" fill="#4a3728" opacity="0.3"/>
    <circle cx="120" cy="122" r="2" fill="#4a3728" opacity="0.3"/>`],

  // ===== SPICES =====
  ['cumin', 'Cumin (Jeera)', `    <ellipse cx="100" cy="75" rx="32" ry="18" stroke-width="2"/>
    <path d="M100 93 L100 162" stroke-width="2.5"/>
    <path d="M96 160 Q100 168 104 160" stroke-width="2"/>
    <ellipse cx="85" cy="72" rx="6" ry="3" stroke-width="1.2" transform="rotate(-20 85 72)"/>
    <ellipse cx="100" cy="68" rx="6" ry="3" stroke-width="1.2" transform="rotate(10 100 68)"/>
    <ellipse cx="115" cy="72" rx="6" ry="3" stroke-width="1.2" transform="rotate(-15 115 72)"/>
    <ellipse cx="90" cy="80" rx="6" ry="3" stroke-width="1.2" transform="rotate(5 90 80)"/>
    <ellipse cx="108" cy="78" rx="6" ry="3" stroke-width="1.2" transform="rotate(-8 108 78)"/>`],

  ['turmeric', 'Turmeric', `    <path d="M70 90 Q65 80 70 60 Q75 45 85 42 Q95 42 95 55 Q95 70 90 90" stroke-width="2"/>
    <path d="M90 90 Q85 75 92 58 Q98 48 108 48 Q115 52 112 65 Q108 80 105 90" stroke-width="2"/>
    <path d="M105 90 Q102 78 108 62 Q115 50 125 52 Q132 58 128 72 Q124 85 120 90" stroke-width="2"/>
    <path d="M70 90 Q68 100 72 108" stroke-width="1.5"/>
    <path d="M90 90 Q88 102 92 112" stroke-width="1.5"/>
    <path d="M105 90 Q103 100 107 110" stroke-width="1.5"/>
    <path d="M120 90 Q118 98 122 106" stroke-width="1.5"/>
    <path d="M60 90 L140 90" stroke-width="0.8" stroke-dasharray="3 3"/>`],

  ['red-chili', 'Red Chili', `    <path d="M100 35 Q80 45 72 70 Q65 100 70 130 Q75 155 90 160 Q100 162 102 145 Q105 115 100 85 Q98 60 100 35" stroke-width="2"/>
    <path d="M100 35 Q110 32 115 38 Q118 45 112 48" stroke-width="1.5"/>
    <path d="M75 80 Q88 75 100 78" stroke-width="0.8"/>
    <path d="M72 110 Q85 105 100 108" stroke-width="0.8"/>
    <path d="M75 140 Q85 135 95 138" stroke-width="0.8"/>`],

  ['coriander', 'Coriander', `    <path d="M100 160 L100 80" stroke-width="2"/>
    <path d="M100 80 L75 55 M100 80 L125 55 M100 80 L100 50" stroke-width="1.5"/>
    <circle cx="75" cy="55" r="4" stroke-width="1.2" fill="#4a3728" opacity="0.3"/>
    <circle cx="125" cy="55" r="4" stroke-width="1.2" fill="#4a3728" opacity="0.3"/>
    <circle cx="100" cy="50" r="4" stroke-width="1.2" fill="#4a3728" opacity="0.3"/>
    <path d="M100 120 Q80 110 70 115 Q62 125 75 128 Q88 128 100 120" stroke-width="1.5"/>
    <path d="M100 120 Q120 110 130 115 Q138 125 125 128 Q112 128 100 120" stroke-width="1.5"/>
    <path d="M100 140 Q80 130 72 138 Q65 148 78 150 Q90 148 100 140" stroke-width="1.5"/>
    <path d="M100 140 Q120 130 128 138 Q135 148 122 150 Q110 148 100 140" stroke-width="1.5"/>`],

  ['black-pepper', 'Black Pepper', `    <rect x="82" y="30" width="36" height="65" rx="6" stroke-width="2"/>
    <path d="M82 50 L118 50" stroke-width="1.5"/>
    <circle cx="96" cy="40" r="3" fill="#4a3728"/>
    <circle cx="104" cy="40" r="3" fill="#4a3728"/>
    <path d="M94 30 L94 24 Q100 18 106 24 L106 30" stroke-width="1.5"/>
    <circle cx="72" cy="115" r="5" fill="#4a3728" opacity="0.5"/>
    <circle cx="88" cy="120" r="5" fill="#4a3728" opacity="0.5"/>
    <circle cx="105" cy="118" r="5" fill="#4a3728" opacity="0.5"/>
    <circle cx="122" cy="122" r="5" fill="#4a3728" opacity="0.5"/>
    <circle cx="80" cy="135" r="5" fill="#4a3728" opacity="0.5"/>
    <circle cx="98" cy="138" r="5" fill="#4a3728" opacity="0.5"/>
    <circle cx="115" cy="135" r="5" fill="#4a3728" opacity="0.5"/>
    <circle cx="130" cy="115" r="5" fill="#4a3728" opacity="0.5"/>`],

  ['garam-masala', 'Garam Masala', `    <path d="M58 95 Q58 145 100 150 Q142 145 142 95" stroke-width="2"/>
    <ellipse cx="100" cy="95" rx="42" ry="14" stroke-width="2"/>
    <path d="M125 85 L158 50" stroke-width="3"/>
    <ellipse cx="162" cy="46" rx="10" ry="6" stroke-width="2" transform="rotate(-50 162 46)"/>
    <circle cx="82" cy="100" r="3" fill="#4a3728"/>
    <circle cx="95" cy="98" r="2" fill="#4a3728"/>
    <circle cx="108" cy="101" r="2.5" fill="#4a3728"/>
    <circle cx="120" cy="98" r="2" fill="#4a3728"/>
    <path d="M72 158 Q100 168 128 158" stroke-width="1.5"/>`],

  ['fenugreek', 'Fenugreek', `    <path d="M90 50 Q70 68 72 90 Q75 105 88 105 Q98 100 96 85 Q94 65 90 50" stroke-width="2"/>
    <path d="M110 50 Q130 68 128 90 Q125 105 112 105 Q102 100 104 85 Q106 65 110 50" stroke-width="2"/>
    <path d="M100 48 L100 32" stroke-width="2"/>
    <path d="M80 78 Q90 74 96 80" stroke-width="0.8"/>
    <path d="M104 80 Q110 74 120 78" stroke-width="0.8"/>
    <ellipse cx="72" cy="130" rx="7" ry="5" stroke-width="1.2" transform="rotate(-10 72 130)"/>
    <ellipse cx="92" cy="134" rx="7" ry="5" stroke-width="1.2" transform="rotate(8 92 134)"/>
    <ellipse cx="112" cy="130" rx="7" ry="5" stroke-width="1.2" transform="rotate(-5 112 130)"/>
    <ellipse cx="130" cy="135" rx="7" ry="5" stroke-width="1.2" transform="rotate(12 130 135)"/>`],

  ['asafoetida', 'Asafoetida (Hing)', `    <rect x="68" y="55" width="64" height="90" rx="5" stroke-width="2"/>
    <path d="M68 72 L132 72" stroke-width="1.5"/>
    <rect x="78" y="58" width="44" height="12" rx="3" stroke-width="1.5"/>
    <text x="100" y="115" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#4a3728" stroke="none">H</text>
    <path d="M78 130 L90 130 M110 130 L122 130" stroke-width="1"/>
    <path d="M82 135 L88 135 M112 135 L118 135" stroke-width="1"/>
    <circle cx="100" cy="155" r="3" fill="#4a3728" opacity="0.3"/>
    <circle cx="112" cy="158" r="2.5" fill="#4a3728" opacity="0.3"/>
    <circle cx="88" cy="157" r="2" fill="#4a3728" opacity="0.3"/>`],
];

items.forEach(([filename, name, drawing]) => {
  const content = makeSVG(name, drawing);
  const filePath = path.join(dir, `${filename}.svg`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created: ${filename}.svg`);
});

console.log(`\nDone! Created ${items.length} SVG files in ${dir}`);
