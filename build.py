#!/usr/bin/env python3
"""
build.py  —  OjoAlFraude build script
Concatena los archivos de src/ en un único dist/OjoAlFraude.html

Uso:  python build.py
"""

import os
import sys

SRC  = os.path.join(os.path.dirname(__file__), 'src')
DIST = os.path.join(os.path.dirname(__file__), 'dist')
OUT  = os.path.join(DIST, 'OjoAlFraude.html')

# Orden de concatenación JS (data primero, lógica después).
# Las funciones JS se izan (hoisting), pero los const se evalúan en orden.
JS_ORDER = [
    'data/test-questions.js',
    'data/nivel-config.js',
    'data/escenarios.js',
    'js/state.js',
    'js/test.js',
    'js/nivel.js',
    'js/results.js',
    'js/sus.js',
    'js/export.js',
]


def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()


def build():
    os.makedirs(DIST, exist_ok=True)

    shell     = read(os.path.join(SRC, 'index.html'))
    css       = read(os.path.join(SRC, 'styles.css'))
    templates = read(os.path.join(SRC, 'templates.html'))

    missing = [p for p in JS_ORDER if not os.path.exists(os.path.join(SRC, p))]
    if missing:
        print(f'ERROR: archivos JS faltantes:\n  ' + '\n  '.join(missing))
        sys.exit(1)

    js = '\n\n'.join(
        f'/* ── {p} ── */\n' + read(os.path.join(SRC, p))
        for p in JS_ORDER
    )

    result = (
        shell
        .replace('<!-- BUILD:CSS -->',       f'<style>\n{css}\n</style>')
        .replace('<!-- BUILD:TEMPLATES -->', templates)
        .replace('<!-- BUILD:JS -->',        f'<script>\n{js}\n</script>')
    )

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(result)

    src_lines  = sum(
        len(open(os.path.join(SRC, p), encoding='utf-8').readlines())
        for p in ['index.html', 'styles.css', 'templates.html'] + JS_ORDER
    )
    dist_lines = len(open(OUT, encoding='utf-8').readlines())
    print(f'Build OK  →  {OUT}')
    print(f'Fuentes: {src_lines} líneas en {len(JS_ORDER)+3} archivos  →  dist: {dist_lines} líneas')


if __name__ == '__main__':
    build()
