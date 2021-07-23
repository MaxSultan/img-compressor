function $(sel, el) {
  return (el || document.body).querySelector(sel);
}

const MAX_WIDTH = 320;
const MAX_HEIGHT = 180;
const MIME_TYPE = "image/jpeg";
let quality = $('select[name="image-quality"]').value;

const input = $('input[name="img-input"]');
const qualitySelector = $('select[name="image-quality"]');

const calculateSize = (img, maxWidth, maxHeight) => {
  let width = img.width;
  let height = img.height;

  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }
  return [width, height];
}

const displayInfo = (label, file) => {
  const p = document.createElement("p");
  p.innerText = `${label} - ${readableBytes(file.size)}`;
  $(".js-images-container").append(p);
}

const displayDownloadLink = (linkText, blobData) => {
  var downloadLink = document.createElement("a");
  downloadLink.innerText = linkText;
  let url = URL.createObjectURL(blobData);
  downloadLink.href = url;
  downloadLink.download = url;
  $(".js-images-container").append(downloadLink)
}

const readableBytes = (bytes) => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

const insertBreak = () => {
  let breakElement = document.createElement("br");
  $(".js-images-container").append(breakElement)
}

qualitySelector.onchange = (event) => {
  event.preventDefault();
  quality = parseInt(event.target.value, 10);
}

input.onchange = (event) => {
  const file = event.target.files[0]; // get the file
  const blobURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = blobURL;

  img.onerror = () => {
    URL.revokeObjectURL(this.src);
    // Handle the failure properly
    alert("Cannot load image");
  };

  img.onload = () => {
    URL.revokeObjectURL(this.src);
    const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;

    const context = canvas.getContext("2d");
    const canvas2 = document.createElement("canvas");
    const context2 = canvas2.getContext("2d")
    canvas2.height = img.height * 0.5;
    canvas2.width = img.width * 0.5;

    // faux bi-cubic image smoothing 
    context2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
    context2.drawImage(img, 0, 0, canvas2.width * 0.5, canvas2.height * 0.5);
    context.drawImage(canvas2, 0, 0, canvas2.width * 0.5, canvas2.height * 0.5, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        // Handle the compressed images. upload or save in local state
        displayInfo("Original file", file);
        displayInfo("Compressed file", blob);
        // add a button with a download feature here
        displayDownloadLink("Dowload Minified Image", blob);
        insertBreak();
      },
      MIME_TYPE,
      quality
    );
    $(".js-images-container").append(canvas);
    input.value = "";
  };
};

