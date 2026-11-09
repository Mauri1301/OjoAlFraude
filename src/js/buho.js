/* Búho guía "Ojito" — SVG compartido (login + juego).
   Guiño al "Ojo" de OjoAlFraude: examina los mensajes con su lupa. */

export function buhoSVG(size = 90) {
  return `
    <svg viewBox="0 0 150 150" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- orejas puntiagudas anguladas -->
      <path d="M36 9 C33 21 39 37 50 46 L59 39 C53 27 45 16 36 9 Z" fill="#5f3d28"/>
      <path d="M108 9 C111 21 105 37 94 46 L85 39 C91 27 99 16 108 9 Z" fill="#5f3d28"/>
      <!-- cuerpo -->
      <path d="M72 22 C102 22 120 46 120 78 C120 110 100 135 72 135 C44 135 24 110 24 78 C24 46 42 22 72 22 Z" fill="#7d5236"/>
      <!-- ala derecha puntiaguda -->
      <path d="M115 78 C126 92 124 116 107 126 C110 112 106 96 103 84 C107 82 112 80 115 78 Z" fill="#6b4529"/>
      <!-- disco facial -->
      <path d="M72 40 C94 38 110 50 110 68 C110 88 92 99 72 99 C52 99 34 88 34 68 C34 50 50 38 72 40 Z" fill="#f2e2c6"/>
      <!-- ojo derecho -->
      <g class="buho-eye">
        <circle cx="90" cy="66" r="14.5" fill="#e3cfa8"/>
        <circle cx="90" cy="66" r="13.5" fill="#fff8ec"/>
        <circle cx="90" cy="66" r="11" fill="#f4b731"/>
        <circle cx="90" cy="66" r="7.3" fill="#241a12"/>
        <circle cx="86.5" cy="61.5" r="2.9" fill="#fff"/>
      </g>
      <!-- pico -->
      <path d="M68 73 L78 73 L73 83 Z" fill="#f0a030"/>
      <!-- chaleco / bandana -->
      <path d="M50 96 C62 90 84 90 96 96 C100 112 94 130 73 132 C52 130 46 112 50 96 Z" fill="#2a3550"/>
      <path d="M50 96 C62 90 84 90 96 96" fill="none" stroke="#3a4870" stroke-width="1.5"/>
      <!-- escudo (logo) con ojo -->
      <path d="M73 103 L83 107 L83 115 C83 121 78 125 73 127 C68 125 63 121 63 115 L63 107 Z" fill="#1c2740" stroke="#e8edf6" stroke-width="1.6"/>
      <ellipse cx="73" cy="114" rx="5.4" ry="3.3" fill="#e8edf6"/>
      <circle cx="73" cy="114" r="1.7" fill="#1c2740"/>
      <!-- patas -->
      <path d="M62 132 l-4 8 M66 132 l0 9 M70 132 l4 8" stroke="#e8952a" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M77 132 l-4 8 M81 132 l0 9 M85 132 l4 8" stroke="#e8952a" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- mango de la lupa -->
      <line x1="43" y1="77" x2="32" y2="90" stroke="#3a4a6b" stroke-width="6.5" stroke-linecap="round"/>
      <!-- ala que sostiene la lupa -->
      <path d="M40 103 C29 99 25 87 31 80 C38 84 46 93 49 103 Z" fill="#6b4529"/>
      <!-- vidrio de la lupa -->
      <circle cx="56" cy="64" r="19" fill="rgba(180,210,240,.28)"/>
      <!-- ojo izquierdo (dentro del lente) -->
      <g class="buho-eye">
        <circle cx="56" cy="65" r="16" fill="#e3cfa8"/>
        <circle cx="56" cy="65" r="15" fill="#fff8ec"/>
        <circle cx="56" cy="65" r="12" fill="#f4b731"/>
        <circle cx="56" cy="65" r="8" fill="#241a12"/>
        <circle cx="52" cy="60.5" r="3.2" fill="#fff"/>
      </g>
      <!-- aro de la lupa -->
      <circle cx="56" cy="64" r="19.5" fill="none" stroke="#3a4a6b" stroke-width="4.5"/>
    </svg>`;
}

// Imagen del búho (PNG ilustrado) para un momento del journey
export function buhoImg(nombre, size = 84, alt = '') {
  return `<img src="/img/${nombre}.png" alt="${alt}" class="buho-pic" style="width:${size}px;height:auto">`;
}

// Búho + nube de diálogo (usado en los escenarios del juego)
export function buildBuho(texto) {
  return `
    <div class="buho-wrap">
      <div class="buho-svg" aria-hidden="true">${buhoImg('buho2', 84)}</div>
      <div class="buho-bubble">
        <span class="buho-nombre">🦉 Ojito</span>
        <p class="body-sm mt-4">${texto}</p>
      </div>
    </div>`;
}
