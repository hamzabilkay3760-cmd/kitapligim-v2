import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'index.html');
const output = resolve(root, 'www');
const html = await readFile(source, 'utf8');
if (!html.includes('<html') && !html.includes('<!DOCTYPE html')) {
  throw new Error('Kitaplığım giriş dosyası geçerli HTML değil.');
}
await mkdir(output, { recursive: true });
await copyFile(source, resolve(output, 'index.html'));
console.log('Kitaplığım web arayüzü mobil paket klasörüne kopyalandı.');
console.log('Not: OCR/API çağrıları ve yerel veri aktarımı henüz mobilde doğrulanmadı.');
