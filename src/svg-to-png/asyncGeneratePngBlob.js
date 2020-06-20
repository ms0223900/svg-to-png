const {
  default: dataURItoBlob,
} = require('./dataUriToBlob')

export const defaultGeneratePngBlobOptions = {
  width: 300,
  height: 300,
}

function asyncGeneratePngBlob(svgBlob, options=defaultGeneratePngBlobOptions) {
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d');

  const image = new Image(options.width, options.height);
  const svgUrl = window.URL.createObjectURL(svgBlob);

  return new Promise((res, rej) => {
    image.onerror = function() {
      rej('image loaded error.');
    };
    image.onload = function() {
      ctx && ctx.drawImage(image, 0, 0);

      const pngDataUri = canvas.toDataURL(`image/${'png'}`);
      const pngBlob = dataURItoBlob(pngDataUri);
    
      URL.revokeObjectURL(svgUrl);
      return res(pngBlob);
    };
    image.src = svgUrl;
  });
}

export default asyncGeneratePngBlob