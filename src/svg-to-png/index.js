import downloadDataBlob from "./downloadDataBlob";

const { default: asyncGeneratePngBlob, defaultGeneratePngBlobOptions } = require("./asyncGeneratePngBlob");
const { default: asyncConvertSvgEltoPngBlob } = require("./asyncConvertSvgEltoPngBlob");

export const defaultDownloadPngFileOptions = {
  fileName: 'file',
  dataType: 'png',
}

class SvgToPng {
  constructor(options=defaultGeneratePngBlobOptions) {
    this.width = options.width
    this.height = options.height
  }

  async asyncGetPngBlob(svgEl=new SVGElement()) {
    const res = await asyncConvertSvgEltoPngBlob(svgEl, {
      width: this.width,
      height: this.height,
    })
    return res
  }

  downloadPngFile(svgEl=new SVGElement(), options=defaultDownloadPngFileOptions) {
    (function () {
      this.asyncGetPngBlob(svgEl)
        .then(pngBlob => {
          downloadDataBlob({
            ...options,
            dataBlob: pngBlob,
          })
        })
    }())
  }
}

export default SvgToPng