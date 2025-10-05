/* 
  Script by PAUL HAYKEENS
  metadata-X - Image Metadata Analyzer
*/


const $ = id => document.getElementById(id);

async function sha256FromArrayBuffer(buffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function pretty(obj) { return JSON.stringify(obj, null, 2); }

async function fetchImageFromUrl(url, useProxy, proxyPrefix) {
  let finalUrl = useProxy ? proxyPrefix + encodeURIComponent(url) : url;
  const resp = await fetch(finalUrl);
  if (!resp.ok) throw new Error('HTTP error ' + resp.status);
  const blob = await resp.blob();
  if (!blob.type.startsWith('image')) console.warn('Content-Type not image:', blob.type);
  return blob;
}

async function stripMetadataToJPEG(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  return await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.92));
}

const analyzeBtn = $('analyzeBtn');
const fileInput = $('fileinput');
const urlInput = $('urlInput');
const useProxy = $('useProxy');
const proxyPrefix = $('proxyPrefix');
const summary = $('summary');
const rawmeta = $('rawmeta');
const previewArea = $('previewArea');
const flagsDiv = $('flags');
const stripBtn = $('stripBtn');
const downloadJson = $('downloadJson');
const openMap = $('openMap');
const revGeo = $('revGeo');
const revGeoResult = $('revGeoResult');
let lastReport = null;

analyzeBtn.addEventListener('click', async () => {
  analyzeBtn.disabled = true; analyzeBtn.textContent = 'Analyzing...';
  try {
    let fileBlob = null;
    let fileName = 'image';
    const urlVal = urlInput.value.trim();

    if (fileInput.files.length > 0 && (!urlVal || confirm('Use local file instead of URL?'))) {
      fileBlob = fileInput.files[0];
      fileName = fileBlob.name;
    } else if (urlVal) {
      fileBlob = await fetchImageFromUrl(urlVal, useProxy.checked, proxyPrefix.value);
      fileName = (new URL(urlVal)).pathname.split('/').pop() || 'remote_image';
    } else {
      alert('Please select a file or enter an image URL.');
      return;
    }

    const arr = await fileBlob.arrayBuffer();
    const sha = await sha256FromArrayBuffer(arr);
    const meta = await exifr.parse(arr, { tiff: true, xmp: true, iptc: true, gps: true });
    const normalized = meta || {};

    // preview
    previewArea.innerHTML = '';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(fileBlob);
    img.className = 'thumb';
    previewArea.appendChild(img);

    // summary
    const sum = [];
    sum.push(`<div><strong>Source:</strong> ${urlVal ? urlVal : 'Local file'}</div>`);
    sum.push(`<div><strong>File:</strong> ${fileName} (${Math.round(arr.byteLength / 1024)} KB)</div>`);
    if (meta?.Make || meta?.Model) sum.push(`<div><strong>Device:</strong> ${meta.Make || ''} ${meta.Model || ''}</div>`);
    if (meta?.DateTimeOriginal) sum.push(`<div><strong>Date Taken:</strong> ${meta.DateTimeOriginal}</div>`);
    if (meta?.latitude && meta?.longitude) sum.push(`<div><strong>GPS:</strong> ${meta.latitude}, ${meta.longitude}</div>`);
    sum.push(`<div><strong>SHA-256:</strong> <code>${sha}</code></div>`);
    summary.innerHTML = sum.join('');

    rawmeta.textContent = pretty(meta);

    // heuristics
    const flags = [];
    if (!meta?.DateTimeOriginal) flags.push('No EXIF timestamp found.');
    if (meta?.Software?.match(/photoshop|gimp|snapseed/i)) flags.push('Edited software detected: ' + meta.Software);
    if (!meta?.latitude) flags.push('No GPS data.');
    flags.push('Hash computed successfully.');
    flagsDiv.innerHTML = flags.map(f => `<div>• ${f}</div>`).join('');

    lastReport = { meta, fileBlob, fileName, sha };

    // map
    if (meta.latitude && meta.longitude) {
      openMap.style.display = 'inline-block';
      openMap.onclick = () => window.open(`https://www.openstreetmap.org/?mlat=${meta.latitude}&mlon=${meta.longitude}#map=18/${meta.latitude}/${meta.longitude}`);
      revGeo.style.display = 'inline-block';
      revGeo.onclick = async () => {
        revGeoResult.textContent = 'Reverse geocoding...';
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${meta.latitude}&lon=${meta.longitude}`);
        const j = await r.json();
        revGeoResult.textContent = j.display_name || 'No result';
      };
    } else {
      openMap.style.display = 'none';
      revGeo.style.display = 'none';
      revGeoResult.textContent = '';
    }

    stripBtn.disabled = false;
    downloadJson.disabled = false;
  } catch (e) {
    alert('Error: ' + e.message);
    console.error(e);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze';
  }
});

stripBtn.addEventListener('click', async () => {
  if (!lastReport) { alert('Run analysis first.'); return; }
  const blob = await stripMetadataToJPEG(lastReport.fileBlob);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = lastReport.fileName.replace(/\.[^.]+$/, '') + '_cleaned.jpg';
  a.click();
});

downloadJson.addEventListener('click', () => {
  if (!lastReport) { alert('Run analysis first.'); return; }
  const blob = new Blob([pretty(lastReport.meta)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = lastReport.fileName.replace(/\.[^.]+$/, '') + '_metadata.json';
  a.click();
});
