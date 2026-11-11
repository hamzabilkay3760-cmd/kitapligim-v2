import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'index.html');
const output = resolve(root, 'www');
const html = await readFile(source, 'utf8');
if (!html.includes('<html') && !html.includes('<!DOCTYPE html')) {
  throw new Error('Kitaplığım giriş dosyası geçerli HTML değil.');
}

await mkdir(output, { recursive: true });
await build({
  entryPoints: [resolve(root, 'mobile/quote-scanner.ts')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: resolve(output, 'mobile-quote-scanner.js'),
  minify: false,
  sourcemap: false,
});

const marker = '</body>';
if (!html.includes(marker)) throw new Error('Mobil script yerleştirme noktası bulunamadı.');
const mobileHtml = html.replace(marker, '  <script src="./mobile-quote-scanner.js"></script>\n'+marker);
await writeFile(resolve(output, 'index.html'), mobileHtml, 'utf8');

console.log('Kitaplığım web arayüzü mobil paket klasörüne hazırlandı.');
console.log('Mobil Alıntı Tara köprüsü paketlendi: kamera + cihaz içi OCR + satır seçimi.');
console.log('Not: iOS/Android gerçek cihaz derleme ve izin testleri yapılmadan canlı mağaza sürümü sayılmaz.');
