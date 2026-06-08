(() => {
  const $ = id => document.getElementById(id);
  const files = []; // {name, data, size}
  let compressedResults = [];

  const dropZone = $('dropZone');
  const fileInput = $('fileInput');
  const fileList = $('fileList');
  const actions = $('actions');
  const results = $('results');
  const resultList = $('resultList');
  const resultSummary = $('resultSummary');
  const status = $('status');
  const statusText = $('status-text');
  const qualitySlider = $('quality');
  const qualityVal = $('quality-val');

  qualitySlider.oninput = () => { qualityVal.textContent = qualitySlider.value; };

  // 文件读取
  function readFile(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        data: reader.result.split(',')[1],
        size: file.size,
      });
      reader.readAsDataURL(file);
    });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }

  // 拖拽
  dropZone.onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    for (const f of fileInput.files) files.push(await readFile(f));
    renderFileList();
    fileInput.value = '';
  };
  dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add('dragover'); };
  dropZone.ondragleave = () => dropZone.classList.remove('dragover');
  dropZone.ondrop = async e => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    for (const f of e.dataTransfer.files) {
      if (f.type.startsWith('image/')) files.push(await readFile(f));
    }
    renderFileList();
  };

  function renderFileList() {
    fileList.innerHTML = files.map((f, i) =>
      `<div class="file-item">
        <span class="fname">${f.name}</span>
        <span class="fsize">${formatSize(f.size)}</span>
        <button class="remove" data-i="${i}">&times;</button>
      </div>`
    ).join('');
    actions.style.display = files.length > 0 ? 'flex' : 'none';
    results.style.display = 'none';

    fileList.querySelectorAll('.remove').forEach(btn => {
      btn.onclick = () => { files.splice(Number(btn.dataset.i), 1); renderFileList(); };
    });
  }

  // 清空
  $('btnClear').onclick = () => {
    files.length = 0;
    compressedResults = [];
    renderFileList();
    results.style.display = 'none';
  };

  // 压缩
  $('btnCompress').onclick = async () => {
    if (!files.length) return;
    status.style.display = 'flex';
    statusText.textContent = `压缩中... (0/${files.length})`;

    const quality = Number(qualitySlider.value);
    const maxWidth = $('maxWidth').value ? Number($('maxWidth').value) : undefined;
    const maxHeight = $('maxHeight').value ? Number($('maxHeight').value) : undefined;

    try {
      const res = await fetch('/api/compress-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files, quality }),
      });
      const data = await res.json();

      compressedResults = data.results.filter(r => !r.error);
      const errors = data.results.filter(r => r.error);

      // 显示结果
      resultList.innerHTML = data.results.map(r => {
        if (r.error) return `<div class="result-item"><span class="rname">${r.name}</span><span style="color:#ff4d4f">${r.error}</span></div>`;
        return `<div class="result-item">
          <span class="rname">${r.name}</span>
          <span class="rsizes">${formatSize(r.originalSize)} → ${formatSize(r.compressedSize)}</span>
          <span class="rratio">-${r.ratio}%</span>
        </div>`;
      }).join('');

      const totalOriginal = compressedResults.reduce((s, r) => s + r.originalSize, 0);
      const totalCompressed = compressedResults.reduce((s, r) => s + r.compressedSize, 0);
      const totalRatio = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;
      resultSummary.textContent = `总计：${formatSize(totalOriginal)} → ${formatSize(totalCompressed)}，节省 ${totalRatio}%`;

      results.style.display = 'block';
      toast(`压缩完成，${compressedResults.length} 个文件`);

      if (errors.length > 0) toast(`${errors.length} 个文件压缩失败`);
    } catch (err) {
      toast('压缩失败: ' + err.message);
    } finally {
      status.style.display = 'none';
    }
  };

  // 保存
  $('btnSave').onclick = async () => {
    if (!compressedResults.length) return;
    try {
      const res = await fetch('/api/save-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: compressedResults }),
      });
      const data = await res.json();
      if (data.ok) {
        toast(`已保存 ${data.count} 个文件到桌面 compressed 文件夹`);
        // 打开目录
        fetch('/api/open-dir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dir: data.dir }),
        });
      }
    } catch (err) {
      toast('保存失败: ' + err.message);
    }
  };
})();
