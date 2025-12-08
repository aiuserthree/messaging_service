const fs = require('fs');

// 간단한 ICO 파일 헤더 (16x16 아이콘)
// ICO 파일 형식: 헤더 + 이미지 데이터
// 가장 간단한 방법은 SVG를 사용하거나, 간단한 PNG를 생성하는 것입니다.
// 하지만 브라우저 호환성을 위해 실제 .ico 파일이 필요합니다.

// 간단한 16x16 PNG를 ICO로 변환하는 것은 복잡하므로,
// 대신 간단한 SVG를 사용하고, 빈 favicon.ico 파일을 생성합니다.

// 실제로는 온라인 도구나 이미지 라이브러리를 사용하는 것이 좋지만,
// 여기서는 간단한 방법으로 처리합니다.

// 빈 favicon.ico 파일 생성 (최소한의 ICO 헤더만 포함)
const icoHeader = Buffer.from([
  0x00, 0x00,  // Reserved (must be 0)
  0x01, 0x00,  // Type (1 = ICO)
  0x01, 0x00,  // Number of images
  0x00,        // Width (0 = 256)
  0x00,        // Height (0 = 256)
  0x00,        // Color palette (0 = no palette)
  0x00,        // Reserved
  0x01, 0x00,  // Color planes
  0x20, 0x00,  // Bits per pixel (32)
  0x00, 0x00, 0x00, 0x00,  // Image size (will be calculated)
  0x16, 0x00, 0x00, 0x00,  // Offset to image data (22 bytes)
]);

// 간단한 16x16 RGBA 이미지 데이터 (파란색 배경)
const imageData = Buffer.alloc(16 * 16 * 4);
for (let i = 0; i < 16 * 16; i++) {
  const offset = i * 4;
  imageData[offset] = 0x25;     // R (37)
  imageData[offset + 1] = 0x63;  // G (99)
  imageData[offset + 2] = 0xeb; // B (235)
  imageData[offset + 3] = 0xff; // A (255)
}

// 이미지 크기 업데이트
const imageSize = imageData.length;
icoHeader.writeUInt32LE(imageSize, 8);

// ICO 파일 생성
const icoFile = Buffer.concat([icoHeader, imageData]);
fs.writeFileSync('favicon.ico', icoFile);

console.log('favicon.ico created successfully');





