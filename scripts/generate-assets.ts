import * as fs from 'fs';
import * as path from 'path';

const ASSETS_DIR = path.resolve(__dirname, '..', 'src', 'assets');

interface AssetConfig {
  name: string;
  width: number;
  height: number;
  color: { r: number; g: number; b: number; a: number };
}

const ASSETS: AssetConfig[] = [
  { name: 'icon.png', width: 1024, height: 1024, color: { r: 10, g: 10, b: 10, a: 255 } },
  { name: 'adaptive-icon.png', width: 1024, height: 1024, color: { r: 10, g: 10, b: 10, a: 255 } },
  { name: 'splash.png', width: 1284, height: 2778, color: { r: 10, g: 10, b: 10, a: 255 } },
  { name: 'favicon.png', width: 48, height: 48, color: { r: 10, g: 10, b: 10, a: 255 } },
];

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc >>>= 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPNG(width: number, height: number, r: number, g: number, b: number, a: number): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 6;   // color type: RGBA
  ihdrData[10] = 0;  // compression
  ihdrData[11] = 0;  // filter
  ihdrData[12] = 0;  // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk - raw pixel data
  const rowData: Buffer[] = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter byte: None
    for (let x = 0; x < width; x++) {
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    rowData.push(row);
  }

  const rawData = Buffer.concat(rowData);

  // Compress using zlib (Node built-in)
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function generate() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
    console.log(`Created directory: ${ASSETS_DIR}`);
  }

  for (const asset of ASSETS) {
    const filePath = path.join(ASSETS_DIR, asset.name);
    console.log(`Generating ${asset.name} (${asset.width}x${asset.height})...`);
    const png = createPNG(asset.width, asset.height, asset.color.r, asset.color.g, asset.color.b, asset.color.a);
    fs.writeFileSync(filePath, png);
    const sizeKb = (png.length / 1024).toFixed(2);
    console.log(`  Wrote ${png.length} bytes (${sizeKb} KB) to ${filePath}`);
  }

  console.log('\nDone! All assets generated successfully.');
}

generate();
