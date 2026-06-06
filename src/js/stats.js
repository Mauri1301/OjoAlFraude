/* ══════════════════════════════════════════════
   Funciones estadísticas puras (sin librerías).
   t de Student para muestras relacionadas y
   valor p vía función beta incompleta regularizada
   (continued fraction — Abramowitz & Stegun 26.5.8).
══════════════════════════════════════════════ */

export function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Desviación estándar muestral (denominador n-1)
export function stdDev(arr) {
  const n = arr.length;
  if (n < 2) return 0;
  const m = mean(arr);
  const varianza = arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / (n - 1);
  return Math.sqrt(varianza);
}

/* ── ln Γ(x) — Lanczos (Abramowitz & Stegun 6.1) ── */
function gammln(xx) {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let x = xx, y = xx;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) { y += 1; ser += cof[j] / y; }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/* ── Fracción continua para la función beta incompleta (A&S 26.5.8) ── */
function betacf(a, b, x) {
  const MAXIT = 200, EPS = 3e-7, FPMIN = 1e-30;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

// Función beta incompleta regularizada I_x(a,b)
function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1 - x)
  );
  if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
  return 1 - bt * betacf(b, a, 1 - x) / b;
}

// P(|T| > |t|) — valor p de dos colas para t con df grados de libertad
function tDistTwoTailedP(t, df) {
  if (!isFinite(t)) return 0;
  const x = df / (df + t * t);
  return betai(df / 2, 0.5, x);
}

/* ── Prueba t para muestras relacionadas ──
   o1, o2: vectores emparejados (mismo participante).
   Δ = o2 - o1. H₁ direccional: μ(o2) > μ(o1) → p de una cola.
*/
export function pairedTTest(o1, o2) {
  const n = o1.length;
  const deltas = o1.map((v, i) => o2[i] - v);
  const md = mean(deltas);
  const sd = stdDev(deltas);
  const df = n - 1;

  let t, pTwo;
  if (sd === 0) {
    t = md === 0 ? 0 : (md > 0 ? Infinity : -Infinity);
    pTwo = md === 0 ? 1 : 0;
  } else {
    t = md / (sd / Math.sqrt(n));
    pTwo = tDistTwoTailedP(t, df);
  }
  // Una cola (H₁: mejora). Si t>0 la mitad del área; si t≤0, complemento.
  const pOne = t > 0 ? pTwo / 2 : 1 - pTwo / 2;

  return { t, df, n, md, sd, pTwo, pOne };
}
