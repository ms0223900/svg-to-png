const { default: asyncGeneratePngBlob, defaultGeneratePngBlobOptions } = require("./asyncGeneratePngBlob");

function generateSvgBlob(svgEl) {
  const dataStr = new XMLSerializer().serializeToString(svgEl);
  const dataBlob = new Blob([dataStr], {
    type: 'image/svg+xml;charset=utf-8',
  });
  return dataBlob;
}

async function asyncConvertSvgEltoPngBlob(svgEl, options=defaultGeneratePngBlobOptions) {
  const svgBlob = generateSvgBlob(svgEl)
  const pngBlob = await asyncGeneratePngBlob(svgBlob, options)
  return pngBlob
}

export default asyncConvertSvgEltoPngBlob