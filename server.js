const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
app.use(express.json({ limit: '500mb' }));
app.use(express.static(path.join(__dirname, 'renderer')));

const PORT = 3458;

// ========== 图片压缩 ==========
app.post('/api/compress-image', async (req, res) => {
  try {
    const { data, quality = 80, format, maxWidth, maxHeight } = req.body;
    const input = Buffer.from(data, 'base64');
    let pipeline = sharp(input);
    const meta = await sharp(input).metadata();

    // 缩放
    if (maxWidth || maxHeight) {
      pipeline = pipeline.resize(maxWidth || null, maxHeight || null, { fit: 'inside', withoutEnlargement: true });
    }

    // 根据格式压缩
    const outFormat = format || meta.format || 'jpeg';
    if (outFormat === 'jpeg' || outFormat === 'jpg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (outFormat === 'png') {
      pipeline = pipeline.png({ compressionLevel: Math.round((100 - quality) / 11) });
    } else if (outFormat === 'webp') {
      pipeline = pipeline.webp({ quality });
    }

    const output = await pipeline.toBuffer();
    const newMeta = await sharp(output).metadata();

    res.json({
      data: output.toString('base64'),
      originalSize: input.length,
      compressedSize: output.length,
      ratio: Math.round((1 - output.length / input.length) * 100),
      format: newMeta.format,
      width: newMeta.width,
      height: newMeta.height,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== 批量图片压缩 ==========
app.post('/api/compress-batch', async (req, res) => {
  try {
    const { files, quality = 80 } = req.body;
    const results = [];

    for (const file of files) {
      try {
        const input = Buffer.from(file.data, 'base64');
        const meta = await sharp(input).metadata();
        let pipeline = sharp(input);
        const fmt = meta.format || 'jpeg';

        if (fmt === 'jpeg' || fmt === 'jpg') {
          pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        } else if (fmt === 'png') {
          pipeline = pipeline.png({ compressionLevel: Math.round((100 - quality) / 11) });
        } else if (fmt === 'webp') {
          pipeline = pipeline.webp({ quality });
        } else {
          pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        }

        const output = await pipeline.toBuffer();
        results.push({
          name: file.name,
          data: output.toString('base64'),
          originalSize: input.length,
          compressedSize: output.length,
          ratio: Math.round((1 - output.length / input.length) * 100),
        });
      } catch (err) {
        results.push({ name: file.name, error: err.message });
      }
    }

    res.json({ results });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== 保存文件 ==========
app.post('/api/save', (req, res) => {
  try {
    const { data, filename, outputDir } = req.body;
    const dir = outputDir || path.join(require('os').homedir(), 'Desktop', 'compressed');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const safeName = filename.replace(/[\\/:*?"<>|]/g, '_');
    const filePath = path.join(dir, safeName);
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    res.json({ ok: true, path: filePath });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== 保存批量结果 ==========
app.post('/api/save-batch', (req, res) => {
  try {
    const { files, outputDir } = req.body;
    const dir = outputDir || path.join(require('os').homedir(), 'Desktop', 'compressed');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const saved = [];
    for (const file of files) {
      if (file.error) continue;
      const safeName = file.name.replace(/[\\/:*?"<>|]/g, '_');
      const filePath = path.join(dir, safeName);
      fs.writeFileSync(filePath, Buffer.from(file.data, 'base64'));
      saved.push(filePath);
    }
    res.json({ ok: true, count: saved.length, dir });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== 打开目录 ==========
app.post('/api/open-dir', (req, res) => {
  const { dir } = req.body;
  if (dir && fs.existsSync(dir)) {
    require('child_process').exec(`explorer "${dir}"`);
    res.json({ ok: true });
  } else {
    res.status(400).json({ error: '目录不存在' });
  }
});

app.listen(PORT, () => console.log(`文件压缩器: http://localhost:${PORT}`));
module.exports = app;
