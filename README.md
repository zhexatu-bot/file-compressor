# 文件压缩器 / File Compressor

发邮件附件太大发不出去，微信传图片被压缩得面目全非，上传简历提示文件过大。这些问题的根源都一样：图片文件太大了。之前要么用在线压缩网站（要注册、限制次数、上传到别人服务器），要么用 PS 一张张手动调（太慢）。所以做了这个批量图片压缩工具。

Email attachment too large to send. WeChat destroys image quality when transferring. Resume upload says "file too large." The root cause is always the same: image files are too big. Online compressors require registration, limit usage, and upload your files to their servers. Photoshop works but is too slow for batches. So I built this batch image compressor.

---

## 功能 / Features

**批量压缩 / Batch Compress**: 一次拖进去几十张图片，一键全部压缩。Drag in dozens of images at once, compress all with one click.

**质量可调 / Adjustable Quality**: 压缩质量从 10% 到 100% 自由调节，平衡文件大小和画质。Quality slider from 10% to 100%, balance file size and image quality.

**尺寸缩放 / Resize**: 可以设置最大宽高，自动等比缩放。Set max width/height, auto-scale proportionally.

**实时预览 / Live Preview**: 压缩前后的文件大小、压缩比例一目了然。See original vs compressed size and ratio at a glance.

**一键保存 / One-Click Save**: 压缩完直接保存到桌面 compressed 文件夹，自动打开目录。Save all compressed files to Desktop/compressed folder, auto-open directory.

## 支持格式 / Supported Formats

- JPG / JPEG
- PNG
- WebP

## 优势 / Why This Tool

**本地处理 / Local**: 图片不会上传到任何服务器，全部在自己电脑上压缩。Images never leave your machine. All compression happens locally.

**零限制 / Unlimited**: 没有"每天免费5张"的限制，想压多少压多少。No "5 free per day" limits. Compress as many as you want.

**批量处理 / Batch Processing**: 一次处理几十上百张，不用手动一张张来。Process hundreds of images at once, no manual work.

**高压缩率 / High Compression**: 使用 mozjpeg 算法，同等画质下文件更小。Uses mozjpeg algorithm for smaller files at the same quality level.

**零依赖 / Zero Dependencies**: 安装包直接用，不需要装任何东西。Installer works out of the box.

## 安装 / Installation

从 [Releases](../../releases) 下载安装包，双击安装即可。

Download from [Releases](../../releases), double-click to install.

源码运行 / Run from source:

```bash
npm install
npm start
```

## 技术栈 / Tech Stack

- Electron 桌面框架 / Desktop framework
- sharp（高性能图片处理库） / High-performance image processing library
- Express 本地 API / Local API

## 联系方式 / Contact

- GitHub: [zhexatu-bot](https://github.com/zhexatu-bot)
- WeChat: matlabpython888
