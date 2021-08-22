/* DOCUMENTATION */
/* 
RESIZER is a function that accepts an  options object and returns an object with several properties 

inputs: 
----------------------------------------------------------------------------------------------------------
example:

resize({ 
    file: ???, 
    aspectRatioPreserved: true, 
    inputWidth: 300, 
    inputHeight: 300, 
    smoothingOptions: "bi-linear", 
    quality: 0.7 
})
----------------------------------------------------------------------------------------------------------
file --  
an image file (what kind of file formats work/dont work?  jpeg and png work. svg works but can sometimes have odd side efects (alpha layer turned black))
this should be added to the function as an img url, file, image blob, 

aspectRatioPreserved (Boolean) --
true|false
true - keep the proportions of the image (aspect ratio) the same
false - disregard the aspect ratio of the image

inputHeight/inputWidth (Number) -- 
a number greater than 0 measured in pixels. keep in mind that input height and input width represent the maximum dimensions 
and may not be the exact dimensions if the aspect ratio is preserved

smoothingOptions (String) -- 
"bi-cubic"|"bi-linear"
the smoothness of the image -  when images changes dimensions, information is either lost or more informaiton is needed.
Smoothing options dictate how the decision of how to turn 4 pixels into one is made (assuming the image is shrinking)
Or how to come up with new pixels in the case of an enlarged image

quality (float) --
positive floating point number from 0 - 1
represets the degree of image quality with 1 being highest quality and 0 being the lowest


return:
an object with the following fields is returned

blob - binary encoding of the image data
objUrl - a local url that can be used to view the image on your local machine
dataUrl - a url that can be used to access the image from any client

*/

// How do you write an iife that accepts parameters/args?
// how do you export a function for use in a package?

// (async function () {
//     'use strict';

// TODO: add documentation for all new functions

const Mini = (function () {

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

    function canvasToBlob(inputElement) {
        const ret = {};
        return new Promise((resolve, reject) => {
            inputElement.toBlob(
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
        })
    }

    function resize(file, aspectRatioPreserved, inputWidth, inputHeight) {
        return new Promise((resolve, reject) => {
            let img = new Image();


            img.onerror = function () {
                URL.revokeObjectURL(this.src);
                reject(Error("Cannot load Image"));
            };

            img.onload = function () {
                URL.revokeObjectURL(this.src);

                const [newWidth, newHeight] = calculateSize(img, aspectRatioPreserved, inputWidth, inputHeight);
                const canvas = document.createElement("canvas");
                canvas.width = newWidth;
                canvas.height = newHeight;


                const canvas2 = document.createElement("canvas");

                canvas2.height = newHeight * 0.5;
                canvas2.width = newWidth * 0.5;

                resolve({ canvas, canvas2, img, newWidth, newHeight })
            }

            img.src = window.URL.createObjectURL(file);
        })

    }

    function smoothCanvas(img, canvas, canvas2, smoothingOptions, newWidth, newHeight) {
        return new Promise((resolve) => {
            const context = canvas.getContext("2d");
            const context2 = canvas2.getContext("2d")
            if (smoothingOptions === 'bi-linear') {
                context.drawImage(img, 0, 0, newWidth, newHeight);
            } else {
                // faux bi-cubic image smoothing 
                context2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
                context2.drawImage(img, 0, 0, canvas2.width * 0.5, canvas2.height * 0.5);
                context.drawImage(canvas2, 0, 0, canvas2.width * 0.5, canvas2.height * 0.5, 0, 0, canvas.width, canvas.height);
            }
            resolve(canvas)
        })

    }

    return {
        compressResizeBlobify: function (file, { aspectRatioPreserved = true, inputWidth, inputHeight, smoothingOptions = "bi-linear", quality = 0.7 }) {
            const ret = {};
            return new Promise((resolve, reject) => {

                resize(file, aspectRatioPreserved, inputWidth, inputHeight)
                    .then(({ canvas, canvas2, img, newWidth, newHeight }) => {
                        smoothCanvas(img, canvas, canvas2, smoothingOptions, newWidth, newHeight).then((canvas) => {
                            ret.canvas = canvas
                            canvasToBlob(ret.canvas)
                                .then(({ dataURL, objUrl, blob }) => {
                                    ret.dataURL = dataURL;
                                    ret.objUrl = objUrl;
                                    ret.blob = blob;
                                    resolve(ret);
                                })
                        })
                    })
                    .catch(error => reject(error))
            })
        },
        smoothCanvas: smoothCanvas,
        resize: resize,
        canvasToBlob: canvasToBlob,
        blobToDataUrl, blobToDataUrl,
    }

})();




    // if ('undefined' === typeof module) {
    //     module.exports = {
    //         resizer: RESIZER.resize,
    //     }

    //     // export default RESIZER;
    // }
// }());



