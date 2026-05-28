# build.ps1 — OjoAlFraude build script (PowerShell)
# Uso: .\build.ps1
# Requiere: PowerShell 5.1+ (incluido en Windows 10/11)

$SRC  = Join-Path $PSScriptRoot "src"
$DIST = Join-Path $PSScriptRoot "dist"
$OUT  = Join-Path $DIST "OjoAlFraude.html"

$JS_ORDER = @(
  "data/test-questions.js",
  "data/nivel-config.js",
  "data/escenarios.js",
  "js/state.js",
  "js/test.js",
  "js/nivel.js",
  "js/results.js",
  "js/sus.js",
  "js/export.js"
)

New-Item -ItemType Directory -Path $DIST -Force | Out-Null

$missing = $JS_ORDER | Where-Object { -not (Test-Path (Join-Path $SRC $_)) }
if ($missing) {
  Write-Host "ERROR: archivos JS faltantes:"
  $missing | ForEach-Object { Write-Host "  $_" }
  exit 1
}

$shell     = Get-Content (Join-Path $SRC "index.html")    -Raw -Encoding UTF8
$css       = Get-Content (Join-Path $SRC "styles.css")    -Raw -Encoding UTF8
$templates = Get-Content (Join-Path $SRC "templates.html") -Raw -Encoding UTF8

$jsParts = $JS_ORDER | ForEach-Object {
  $path    = Join-Path $SRC $_
  $content = Get-Content $path -Raw -Encoding UTF8
  "/* -- $_ -- */`n$content"
}
$js = $jsParts -join "`n`n"

$result = $shell `
  -replace '<!-- BUILD:CSS -->',       "<style>`n$css`n</style>" `
  -replace '<!-- BUILD:TEMPLATES -->', $templates `
  -replace '<!-- BUILD:JS -->',        "<script>`n$js`n</script>"

[System.IO.File]::WriteAllText($OUT, $result, [System.Text.Encoding]::UTF8)

$srcLines  = ($JS_ORDER | ForEach-Object { (Get-Content (Join-Path $SRC $_)).Count }) | Measure-Object -Sum | Select-Object -ExpandProperty Sum
$srcLines += (Get-Content (Join-Path $SRC "index.html")).Count
$srcLines += (Get-Content (Join-Path $SRC "styles.css")).Count
$srcLines += (Get-Content (Join-Path $SRC "templates.html")).Count
$distLines = (Get-Content $OUT).Count

Write-Host "Build OK  ->  $OUT"
Write-Host "Fuentes: $srcLines lineas en $($JS_ORDER.Count + 3) archivos  ->  dist: $distLines lineas"
