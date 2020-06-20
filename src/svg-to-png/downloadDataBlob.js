export const defaultSingleDownloadLinkOptions = {
  dataBlob: new Blob(),
  fileName: 'folder',
  dataType: 'png',
}

function downloadDataBlob({
  dataBlob,
  fileName,
  dataType,
}=defaultSingleDownloadLinkOptions) {
  const invisibleLink = document.createElement('a');
  invisibleLink.style.display = 'none';
  document.body.appendChild(invisibleLink);

  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // Manage IE11+ & Edge
    window.navigator.msSaveOrOpenBlob(dataBlob, `${fileName}.${dataType}`);
  } else {
    invisibleLink.setAttribute('href', URL.createObjectURL(dataBlob));
    invisibleLink.setAttribute('download', `${fileName}.${dataType}`);
    invisibleLink.click();
    document.body.removeChild(invisibleLink);
  }
}

export default downloadDataBlob