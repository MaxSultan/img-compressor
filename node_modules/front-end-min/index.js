// var RESIZER;
// (async function () {
//     'use strict';

    function resize(file, { aspectRatioPreserved = true, inputWidth, inputHeight, smoothingOptions = "bi-linear", quality = 0.7 }) {
        const ret = {}
        return new Promise((resolve, reject) => {

            let img = new Image();


            img.onerror = function () {
                URL.revokeObjectURL(this.src);
                reject(Error("Cannot load Image"));
            };

            img.onload = function () {
                // URL.revokeObjectURL(this.src);
                const [newWidth, newHeight] = calculateSize(img, aspectRatioPreserved, inputWidth, inputHeight);
                ret.canvas = document.createElement("canvas");
                ret.canvas.width = newWidth;
                ret.canvas.height = newHeight;

                const context = ret.canvas.getContext("2d");
                const canvas2 = document.createElement("canvas");
                const context2 = canvas2.getContext("2d")
                canvas2.height = newHeight * 0.5;
                canvas2.width = newWidth * 0.5;

                if (smoothingOptions === 'bi-linear') {
                    context.drawImage(img, 0, 0, newWidth, newHeight);
                } else {
                    // faux bi-cubic image smoothing 
                    context2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
                    context2.drawImage(img, 0, 0, canvas2.width * 0.5, canvas2.height * 0.5);
                    context.drawImage(canvas2, 0, 0, canvas2.width * 0.5, canvas2.height * 0.5, 0, 0, ret.canvas.width, ret.canvas.height);
                }

                ret.canvas.toBlob(
                    (blob) => {
                        ret.objUrl = window.URL.createObjectURL(blob);

                        ret.blob = blob;
                        blobToDataUrl(blob).then((dataURL) => {
                            ret.dataUrl = dataURL
                            resolve(ret)
                        }).catch(() => { reject(Error("could not convert to blob")) });
                    },
                    MIME_TYPE,
                    quality
                );
            }

            img.src = window.URL.createObjectURL(file);
        })
    }


    function calculateSize(img, aspectRatioPreserved, inputWidth, inputHeight) {
        let width = img.width;
        let height = img.height;
        let aspectRatio = width / height;
        const timesAspectRatio = (dimension) => {
            return Math.round(dimension * aspectRatio)
        }

        if (aspectRatioPreserved) {
            if (inputWidth && inputHeight) {
                if (aspectRatio > 1) {
                    height = inputHeight;
                    width = timesAspectRatio(inputHeight);
                } else if (aspectRatio < 1) {
                    height = timesAspectRatio(inputWidth);
                    width = inputWidth;
                } else if (aspectRatio === 1) {
                    if (inputHeight < inputWidth) {
                        height = inputHeight;
                        width = timesAspectRatio(inputHeight)
                    } else {
                        width = inputWidth
                        height = timesAspectRatio(inputWidth)
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
            }
            reader.onerror = (e) => {
                reject(e);
            }
            reader.readAsDataURL(blobData)
        });

    }
// }());

module.exports = resize