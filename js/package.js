const Mini = (function () {
  'use strict';

  function calculateSize(img, aspectRatioPreserved, inputWidth, inputHeight) {
    let width = img.width;
    let height = img.height;
    let aspectRatio = width / height;
    const timesAspectRatio = (dimension) => {
      return Math.round(dimension * aspectRatio);
    };

    const dividedByAspectRatio = (dimension) => {
      return Math.round(dimension / aspectRatio);
    };

    if (aspectRatioPreserved) {
      if (inputWidth && inputHeight) {
        if (aspectRatio > 1) {
          height = dividedByAspectRatio(inputWidth);
          width = inputWidth;
        } else if (aspectRatio < 1) {
          height = inputHeight;
          width = timesAspectRatio(inputHeight);
        } else if (aspectRatio === 1) {
          if (inputHeight < inputWidth) {
            height = inputHeight;
            width = timesAspectRatio(inputHeight);
          } else {
            width = inputWidth;
            height = timesAspectRatio(inputWidth);
          }
        }
      } else if (!inputWidth && inputHeight) {
        height = inputHeight;
        width = timesAspectRatio(inputHeight);
      } else if (!inputHeight && inputWidth) {
        height = timesAspectRatio(inputWidth);
        width = inputWidth;
      }
    } else {
      if (inputWidth && inputHeight) {
        height = inputHeight;
        width = inputWidth;
      } else if (!inputWidth && inputHeight) {
        height = inputHeight;
      } else if (!inputHeight && inputWidth) {
        width = inputWidth;
      }
    }
    return [width, height];
  }

  function blobToDataUrl(blobData) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsDataURL(blobData);
    });
  }

  function blobifyCanvas(inputElement, quality) {
    return new Promise((resolve) => {
      inputElement.toBlob(
        (blob) => {
          resolve(blob);
        },
        MIME_TYPE,
        quality,
      );
    });
  }

  function blobToObjectUrl(blob) {
    return new Promise((resolve, reject) => {
      resolve(URL.createObjectURL(blob));
      reject('Could not turn blob into Object Url');
    });
  }

  function calculateNewDims(img, aspectRatioPreserved, inputWidth, inputHeight) {
    return new Promise((resolve, reject) => {
      const [newWidth, newHeight] = calculateSize(
        img,
        aspectRatioPreserved,
        inputWidth,
        inputHeight,
      );

      resolve({ img, newWidth, newHeight });
      reject('Could not Resize Image');
    });
  }

  function resizeImage(img, smoothingOptions, newWidth, newHeight) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const context = canvas.getContext('2d');

      const canvas2 = document.createElement('canvas');
      canvas2.height = newHeight * 0.5;
      canvas2.width = newWidth * 0.5;
      const context2 = canvas2.getContext('2d');

      if (smoothingOptions === 'bi-linear') {
        context.drawImage(img, 0, 0, newWidth, newHeight);
      } else {
        // faux bi-cubic image smoothing
        context2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
        context2.drawImage(img, 0, 0, canvas2.width * 0.5, canvas2.height * 0.5);
        context.drawImage(
          canvas2,
          0,
          0,
          canvas2.width * 0.5,
          canvas2.height * 0.5,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }
      resolve(canvas);
    });
  }

  function imageify(input) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      //   img.setAttribute('crossOrigin', '');
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(img.src);
        reject(error);
      };
      if (typeof input === 'string') {
        img.src = input + '?' + new Date().getTime();
      } else {
        img.src = window.URL.createObjectURL(input);
      }
    });
  }

  function compressResizeBlobify(
    file,
    {
      aspectRatioPreserved = true,
      inputWidth,
      inputHeight,
      smoothingOptions = 'bi-linear',
      quality = 0.7,
    },
  ) {
    const ret = {};
    return new Promise((resolve, reject) => {
      imageify(file)
        .then((img) => {
          calculateNewDims(img, aspectRatioPreserved, inputWidth, inputHeight).then(
            ({ img, newWidth, newHeight }) => {
              resizeImage(img, smoothingOptions, newWidth, newHeight).then((canvas) => {
                ret.canvas = canvas;
                blobifyCanvas(canvas, quality).then((blob) => {
                  ret.blob = blob;
                  blobToDataUrl(blob).then((dataURL) => {
                    ret.dataUrl = dataURL;
                    blobToObjectUrl(blob).then((objUrl) => {
                      ret.objUrl = objUrl;
                      resolve(ret);
                    });
                  });
                });
              });
            },
          );
        })
        .catch((error) => reject(error));
    });
  }

  return {
    compressResizeBlobify,
    resizeImage,
    calculateNewDims,
    blobifyCanvas,
    blobToDataUrl,
    blobToObjectUrl,
    imageify,
  };
})();
