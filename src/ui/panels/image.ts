// Data: Raw data to create preview from
// return: HTML element containing preview
export function createImagePreview(data: ArrayBuffer) {
    // Create parent element
    var element = document.createElement("div");

    // Create Image preview
    var blob = new Blob([data]);
    const imageEl = new Image();
    imageEl.src = URL.createObjectURL(blob);

    // Add data to preview
    element.append(imageEl);

    return element;
}
