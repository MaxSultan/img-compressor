const $ = (sel, el) => {
  return (el || document.body).querySelector(sel);
}

const MIME_TYPE = "image/jpeg";
let quality = parseFloat($('select[name="image-quality"]').value, 10);
let smoothingOptions = "bi-linear";
let inputHeight;
let inputWidth;
let aspectRatioPreserved = true;
let file;

const settingsButton = $('button[name="js-settings-button"]');
const settingsForm = $('form[class="js-settings-form"]');
var $form = $('form[name="js-box"]');

// TODO: add form elements and data fields to an object 
const settingFormObject = {

}

const calculateSize = (img, aspectRatioPreserved, inputWidth, inputHeight) => {
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

const renderMinifiedFile = (file) => {
  var img = new Image();

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
      // TODO: fix this
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
    $('input[name="js-box-file"]').value = "";
  };

  img.src = URL.createObjectURL(file);
}

/* Settings Events */
const listen = (sel, event) => {
  // only ever addEventListener to 'body' or 'form' and then check ev.target
  document.body.addEventListener(event, (ev) => {
    if (!ev.target.matches(sel)) {
      return true;
    }
    if (sel === 'button[name="js-settings-button"]' && event === 'click') {
      toggleElement(settingsForm)
      if (settingsButton.innerText === "Show Settings") {
        settingsButton.innerText = "Hide Settings"
      } else if (settingsButton.innerText === "Hide Settings") {
        settingsButton.innerText = "Show Settings"
      }
    }
    if (sel === 'select[name="image-quality"]' && event === 'change') {
      ev.preventDefault();
      quality = parseFloat(ev.target.value, 10);
    }
    if (sel === 'select[name="smoothing-options"]' && event === 'change') {
      ev.preventDefault();
      smoothingOptions = ev.target.value;
    }
    if (sel === 'input[name="js-aspect-ratio"]' && event === 'change') {
      if ($('input[name="js-aspect-ratio"]').checked) aspectRatioPreserved = true;
      else aspectRatioPreserved = false;
    }
    if (sel === 'input[name="js-height"]' && event === 'change') {
      inputHeight = parseFloat(ev.target.value, 10);
    }
    if (sel === 'input[name="js-width"]' && event === 'change') {
      inputWidth = parseFloat(ev.target.value, 10);
    }
    if (sel === 'input[name="js-box-file"]' && event === 'change') {
      file = ev.target.files[0]; // get the file
      renderMinifiedFile(file);
    }
    // let the children of the div propigate the event up to the div 
    // There is a bug where the drag and drop box turns white when the item crosses the label. 
    // My assumption is that there is no drag and drop events on labels 
    // we need to let the event bubble up/propigate to the div

    if (['form[name="js-box"]', 'div[name="js-box-input"]', 'input[name="js-box-file"]', 'button[name="js-box-button"]'].includes(sel)) {
      if (['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].includes(event)) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      if (['dragover', 'dragenter'].includes(event)) {
        $form.classList.add('is-dragover');
      }
      if (['dragleave', 'dragend', 'drop'].includes(event)) {
        $form.classList.remove('is-dragover');
      }
      if (event === 'drop') {
        file = ev.dataTransfer.files[0];
        renderMinifiedFile(file);
      }
    }
  });
}
listen('button[name="js-settings-button"]', 'click');
listen('select[name="image-quality"]', 'change');
listen('select[name="smoothing-options"]', 'change');
listen('input[name="js-aspect-ratio"]', 'change');
listen('input[name="js-height"]', 'change');
listen('input[name="js-width"]', 'change');
/* End of Settings Events */

listen('input[name="js-box-file"]', 'change');
[
  'form[name="js-box"]',
  'div[name="js-box-input"]',
  'input[name="js-box-file"]',
  'button[name="js-box-button"]',
  'label[name="js-box-label"]',
  'span[name="js-box-dragndrop"]'
].forEach(formItem => {
  ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(event => {
    listen(formItem, event);
  })
})


window.addEventListener("paste", (e) => {
  var item = Array.from(e.clipboardData.items).find(x => /^image\//.test(x.type));
  try {
    file = item.getAsFile();
  } catch {
    alert('This is not an image element')
    return;
  }

  renderMinifiedFile(file);
});