import ReactDOM from 'react-dom';
import JSZIP from 'jszip';
import { svgPaperPartClassName } from 'config';
import { WidthHeight } from 'svg-common-types';
import { Callback } from 'all-common-types';

function dataURItoBlob(dataURI: string) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], {type: mimeString});
  return blob;
}

class DownloadHandler {
  static generatePngBlob(svgBlob: any, options: {
    width: number,
    height: number
  }): Promise<Blob> {
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
  
  static generateSvgBlob(svgEl: Element): Blob {
    const dataStr = new XMLSerializer().serializeToString(svgEl);
    const dataBlob = new Blob([dataStr], {
      type: 'image/svg+xml;charset=utf-8',
    });

    return dataBlob;
  }

  static generateSingleDownloadLink({
    dataBlob,
    folderName,
    dataType,
  }: {
    dataBlob: any
    folderName: string
    dataType: string,
  }) {
    const invisibleLink = document.createElement('a');
    invisibleLink.style.display = 'none';
    document.body.appendChild(invisibleLink);

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // Manage IE11+ & Edge
      window.navigator.msSaveOrOpenBlob(dataBlob, `${folderName}.${dataType}`);
    } else {
      invisibleLink.setAttribute('href', URL.createObjectURL(dataBlob));
      invisibleLink.setAttribute('download', `${folderName}.${dataType}`);
      invisibleLink.click();
      document.body.removeChild(invisibleLink);
    }
  }

  static getSvgSpecs(svgEl: Element): WidthHeight {
    const width = Number(svgEl.getAttribute('width')) || 0;
    const height = Number(svgEl.getAttribute('height')) || 0;
    const res = {
      width, height
    };
    return res;
  }

  static setSvgViewBox(svgEl: Element) {
    return async (cb: ((svgEl: Element) => Promise<any>) | Function) => {
      const originViewBox = svgEl.getAttribute('viewBox') || '';
      const {
        width, height
      } = this.getSvgSpecs(svgEl);
      svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
      await cb(svgEl)
        .then(() => {
          svgEl.setAttribute('viewBox', originViewBox);
        });
      
      return Promise.resolve();
    };
  }

  static addBlobFileToFolder({
    fileName, zipFolder
  }: {
    fileName: string,
    zipFolder: JSZIP
  }) {
    return async (svgEl: Element) => {
      const svgBlob = DownloadHandler.generateSvgBlob(svgEl);
      const svgSpecs = DownloadHandler.getSvgSpecs(svgEl);
  
      const res = await DownloadHandler
        .generatePngBlob(svgBlob, svgSpecs)
        .then(pngBlob => {
          console.log(pngBlob);
          zipFolder.file(`${fileName}.${'png'}`, pngBlob);
          zipFolder.file(`${fileName}.${'svg'}`, svgBlob);
          return true;
        });
      return res;
    };
  }

  static getDownloadHandlingProgressPercent(handled: number, total: number) {
    const res = Math.round((handled / (total)) * 100);
    return res;
  }
  static download({
    containerEl,
    folderName,
    fileNames,
    getHandlingProgressCb
  }: {
    containerEl: HTMLDivElement, 
    folderName: string, 
    fileNames: string[],
    getHandlingProgressCb?: Callback
  }) {
    let handlingProgress = 0; //%
    const jszip = new JSZIP();
    const zipFolder = jszip.folder(folderName);

    const containerDOM = ReactDOM.findDOMNode(containerEl) as Element;

    if(containerDOM) {
      let dataBlobs: Blob[] = [];
      const svgDOMList = containerDOM.getElementsByClassName(svgPaperPartClassName);
      
      const downloadZip = (dataBlob: Blob) => {
        DownloadHandler.generateSingleDownloadLink({
          dataBlob,
          folderName,
          dataType: 'zip'
        });
      };

      (async function() {
        for (let i = 0; i < svgDOMList.length; i++) {
          const svgEl = svgDOMList[i].cloneNode(true) as Element;
          const dataBlob = DownloadHandler.generateSvgBlob(svgEl);
          dataBlobs[i] = dataBlob;

          await DownloadHandler.setSvgViewBox(svgEl)(
            DownloadHandler.addBlobFileToFolder({
              fileName: fileNames[i],
              zipFolder,
            })
          );
          handlingProgress = DownloadHandler.getDownloadHandlingProgressPercent(i + 1, svgDOMList.length);
          getHandlingProgressCb && getHandlingProgressCb(handlingProgress);
          console.log(`svg paper index: ${i} is done.`);
        }
        getHandlingProgressCb && getHandlingProgressCb(0);

        jszip
          .generateAsync({ type: 'blob'})
          .then((ctx) => {
            downloadZip(ctx);
            console.log('download zip');
          });
        
      }());
    }
  }
}

export default DownloadHandler;