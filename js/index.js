const $ = (sel, el) => {
  return (el || document.body).querySelector(sel);
}

const MIME_TYPE = "image/jpeg";
let quality = parseFloat($('select[name="image-quality"]').value, 10);
let smoothingOptions;
let inputHeight;
let inputWidth;
let aspectRatioPreserved = true;

const input = $('input[name="img-input"]');
const qualitySelector = $('select[name="image-quality"]');
const settingsButton = $('button[name="js-settings-button"]');
const settingsForm = $('form[class="js-settings-form"]');
const widthInput = $('input[name="js-width"]');
const heightInput = $('input[name="js-height"]')
const aspectRatioSelector = $('input[name="js-aspect-ratio"]');
const smoothingSelector = $('select[name="smoothing-options"]');

// TODO: add form elements and data fields to an object 
const settingFormObject = {

}

const timesAspectRatio = (dimension, aspectRatio) => {
  return Math.round(dimension * aspectRatio)
}

const calculateSize = (img, aspectRatioPreserved, inputWidth, inputHeight) => {

  let width = img.width;
  let height = img.height;
  let aspectRatio = width / height;

  if (aspectRatioPreserved) {
    if (inputWidth && inputHeight) {
      if (aspectRatio > 1) {
        height = inputHeight;
        width = timesAspectRatio(inputHeight, aspectRatio);
      } else if (aspectRatio < 1) {
        height = timesAspectRatio(inputWidth, aspectRatio);
        width = inputWidth;
      } else if (aspectRatio === 1) {
        if (inputHeight < inputWidth) {
          height = inputHeight;
          width = timesAspectRatio(inputHeight, aspectRatio)
        } else {
          width = inputWidth
          height = timesAspectRatio(inputWidth, aspectRatio)
        }
      }
    } else if (!inputWidth && inputHeight) {
      height = inputHeight;
      width = timesAspectRatio(inputHeight, aspectRatio);
    } else if (!inputHeight && inputWidth) {
      height = timesAspectRatio(inputWidth, aspectRatio);
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

const displayInfo = (label, file, parentElement) => {
  const p = document.createElement("p");
  p.innerText = `${label} - ${readableBytes(file.size)}`;
  parentElement.append(p);
}

const blobToDataUrl = (blobData) => {
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

const displayDownloadLink = (linkText, blobData, parentElement) => {
  var downloadLink = document.createElement("a");
  downloadLink.innerText = linkText;
  let url = URL.createObjectURL(blobData);
  let copybutton = document.createElement("button");
  copybutton.innerText = "Copy Data URL";
  let dataUrl;
  blobToDataUrl(blobData)
    .then(result => {
      dataUrl = result;
    })
    .catch(error => {
      alert("There was an error converting to Data Url")
      console.log(error);
    });
  copybutton.onclick = () => {
      navigator.clipboard.writeText(dataUrl)
    // TODO: UI should reflect a successful or failed copy
  }
  parentElement.append(copybutton);

  downloadLink.href = url;
  downloadLink.download = url;
  parentElement.append(downloadLink);
}

const readableBytes = (bytes) => {
  const i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

const insertBreak = (parentElement) => {
  let breakElement = document.createElement("br");
  parentElement.append(breakElement)
}

const toggleElement = (element) => {
  if (element.style.display === "none") {
    element.style = ""
  } else if (element.style.display === "") {
    element.style = "display: none"
  }
}

const createImageDiv = () => {
  let currentDiv = document.createElement("div");
  $(".js-images-container").append(currentDiv);
  return currentDiv;
}

/* Settings Events */
settingsButton.onclick = () => {
  toggleElement(settingsForm)
  if (settingsButton.innerText === "Show Settings") {
    settingsButton.innerText = "Hide Settings"
  } else if (settingsButton.innerText === "Hide Settings") {
    settingsButton.innerText = "Show Settings"
  }
}

qualitySelector.onchange = (event) => {
  event.preventDefault();
  quality = parseFloat(event.target.value, 10);
}

smoothingSelector.onchange = (event) => {
  event.preventDefault();
  smoothingOptions = event.target.value;
}

aspectRatioSelector.onchange = () => {
  if (this.checked) aspectRatioPreserved = true;
  else aspectRatioPreserved = false;
}

heightInput.onchange = (event) => {
  inputHeight = parseFloat(event.target.value, 10);
}

widthInput.onchange = (event) => {
  inputWidth = parseFloat(event.target.value, 10);
}
/* End of Settings Events */

input.onchange = (event) => {
  const file = event.target.files[0]; // get the file
  const blobURL = URL.createObjectURL(file);
  const img = new Image();
  img.src = blobURL;

  img.onerror = () => {
    URL.revokeObjectURL(this.src);
    // TODO: Handle the failure properly
    alert("Cannot load image");
  };

  img.onload = () => {
    URL.revokeObjectURL(this.src);
    const [newWidth, newHeight] = calculateSize(img, aspectRatioPreserved, inputWidth, inputHeight);
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;

    const context = canvas.getContext("2d");
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
      context.drawImage(canvas2, 0, 0, canvas2.width * 0.5, canvas2.height * 0.5, 0, 0, canvas.width, canvas.height);
    }
    canvas.toBlob(
      (blob) => {
        // Handle the compressed images. upload or save in local state
        let element = createImageDiv();
        element.append(canvas);
        displayInfo("Original file", file, element);
        displayInfo("Compressed file", blob, element);
        displayDownloadLink("Download Minified Image", blob, element);
        insertBreak(element);
      },
      MIME_TYPE,
      quality
    );
    input.value = "";
  };
};

