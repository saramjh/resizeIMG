// Arrays to store resized images and failed images
let resizedImages = []
let failedImages = []
let isResizing = false

// DOM elements
const imageGrid = document.getElementById("imageGrid")
const modal = document.getElementById("resizeModal")
const progressBar = document.getElementById("progressBar")
const progressText = document.getElementById("progressText")
const fileListContainer = document.getElementById("fileList")
const resizedImagesSection = document.getElementById("resizedImagesSection")
const resizeBtn = document.getElementById("resizeBtn")
const downloadZipBtn = document.getElementById("downloadZipBtn")
const fileInput = document.getElementById("fileInput")
const resizeWidthInput = document.getElementById("resizeWidth")
const resizeHeightInput = document.getElementById("resizeHeight")
const prefixCheckbox = document.getElementById("prefixCheckbox")
const formatSelect = document.getElementById("formatSelect")
const errorModal = document.getElementById("errorModal")
const errorFileList = document.getElementById("errorFileList")
const imageUrls = document.getElementById("imageUrls")

// Event listeners for user inputs
fileInput.addEventListener("change", updateFileList)
imageUrls.addEventListener("input", updateFileList)
resizeWidthInput.addEventListener("input", handleDimensionInput)
resizeHeightInput.addEventListener("input", handleDimensionInput)

// Updates the file list displayed in the UI
function updateFileList() {
	const files = Array.from(fileInput.files).filter((file) => isImageFile(file))
	const urls = imageUrls.value.split("\n").filter(Boolean)

	fileListContainer.innerHTML = ""

	if (files.length === 0 && urls.length === 0) {
		alert("No valid image files or URLs found. Please add at least one image or URL.")
		return
	}

	const fileListUl = document.createElement("ul")

	// Add selected files to the list
	Array.from(files).forEach((file, index) => {
		if (isImageFile(file)) {
			const listItem = document.createElement("li")
			listItem.innerHTML = `
                <input type="checkbox" id="file-${index}" checked>
                <label for="file-${index}">${file.name}</label>
            `
			fileListUl.appendChild(listItem)
		} else {
			displayErrorMessage(file.name, "Not an image file")
		}
	})

	// Add selected URLs to the list
	urls.forEach((url, index) => {
		if (isValidImageUrl(url)) {
			const urlIndex = index + files.length
			const listItem = document.createElement("li")
			listItem.innerHTML = `
                <input type="checkbox" id="file-${urlIndex}" checked>
                <label for="file-${urlIndex}">${url}</label>
            `
			fileListUl.appendChild(listItem)
		} else {
			displayErrorMessage(url, "Invalid URL format")
		}
	})

	fileListContainer.appendChild(fileListUl)
}

// Checks if a file is an image based on its MIME type
function isImageFile(file) {
	return file && /image\/(jpg|jpeg|png|gif)/i.test(file.type)
}

// Checks if a URL is a valid image URL
function isValidImageUrl(url) {
	const encodedUrl = encodeURI(url)
	return (encodedUrl.startsWith("http://") || encodedUrl.startsWith("https://")) && /\.(jpg|jpeg|png|gif|webp|tiff)$/i.test(encodedUrl)
}

// Handles the input for resizing dimensions
function handleDimensionInput() {
	const resizeWidth = parseInt(resizeWidthInput.value, 10)
	const resizeHeight = parseInt(resizeHeightInput.value, 10)
	const isWidthInputEmpty = isNaN(resizeWidth) || resizeWidth <= 0
	const isHeightInputEmpty = isNaN(resizeHeight) || resizeHeight <= 0

	if (!isWidthInputEmpty && isHeightInputEmpty) {
		resizeHeightInput.setAttribute("disabled", "true")
		resizeHeightInput.classList.add("disabled-input")
		resizeHeightInput.setAttribute("placeholder", "Enter height (disabled for aspect ratio)")
	} else if (isWidthInputEmpty && !isHeightInputEmpty) {
		resizeWidthInput.setAttribute("disabled", "true")
		resizeWidthInput.classList.add("disabled-input")
		resizeWidthInput.setAttribute("placeholder", "Enter width (disabled for aspect ratio)")
	} else {
		resizeWidthInput.removeAttribute("disabled")
		resizeHeightInput.removeAttribute("disabled")
		resizeWidthInput.classList.remove("disabled-input")
		resizeWidthInput.setAttribute("placeholder", "Enter width")
		resizeHeightInput.classList.remove("disabled-input")
		resizeHeightInput.setAttribute("placeholder", "Enter height")
	}
}

// Begins the image resizing process
function resizeImages() {
	if (isResizing) return

	const resizeWidth = parseInt(resizeWidthInput.value, 10)
	const resizeHeight = parseInt(resizeHeightInput.value, 10)
	const prefix = prefixCheckbox.checked
	const format = formatSelect.value.toLowerCase()

	if (!resizeWidth && !resizeHeight) {
		alert("Please enter at least one dimension.")
		return
	}

	const files = Array.from(fileInput.files).filter((file) => isImageFile(file))
	const urls = imageUrls.value.split("\n").filter(Boolean)

	// Select only checked files and URLs
	const checkedFiles = files.filter((_, index) => document.getElementById(`file-${index}`)?.checked)
	const checkedUrls = urls.filter((_, index) => document.getElementById(`file-${files.length + index}`)?.checked)

	if (checkedFiles.length === 0 && checkedUrls.length === 0) {
		alert("No images or URLs selected for resizing. Please add at least one.")
		return
	}

	isResizing = true
	resizeBtn.disabled = true
	fileInput.disabled = true
	imageUrls.disabled = true
	resizeWidthInput.disabled = true
	resizeHeightInput.disabled = true
	prefixCheckbox.disabled = true
	formatSelect.disabled = true

	modal.classList.remove("hidden")
	let loadedCount = 0
	let resizedCount = 0
	const totalFiles = checkedFiles.length + checkedUrls.length
	const zip = new JSZip()

	resizedImages = [] // Initialize resized images
	failedImages = [] // Initialize failed images

	// Process local files
	checkedFiles.forEach((file, index) => {
		processImageFile(file, index, totalFiles, resizeWidth, resizeHeight, prefix, format)
	})

	// Process URLs
	checkedUrls.forEach((url, index) => {
		processImageUrl(url, index + checkedFiles.length, totalFiles, resizeWidth, resizeHeight, prefix, format)
	})

	// Processes a local image file
	function processImageFile(file, index, totalFiles, resizeWidth, resizeHeight, prefix, format) {
		const reader = new FileReader()
		reader.onload = function (event) {
			resizeAndStoreImage(event.target.result, file.name, resizeWidth, resizeHeight, prefix, format, index, totalFiles)
			loadedCount++
			updateProgress()
		}
		reader.onerror = function (event) {
			const errorMessage = event.target.error.message
			handleProcessingError(file.name, errorMessage)
		}
		reader.readAsDataURL(file)
	}

	// Processes an image URL
	function processImageUrl(url, index, totalFiles, resizeWidth, resizeHeight, prefix, format) {
		const img = new Image()
		img.crossOrigin = "anonymous"

		img.onload = function () {
			const fileName = decodeURIComponent(url.substring(url.lastIndexOf("/") + 1)) || `image-${index}.${format}`
			const dataUrl = getDataUrlFromImage(img, format)
			resizeAndStoreImage(dataUrl, fileName, resizeWidth, resizeHeight, prefix, format, index, totalFiles)
			loadedCount++
			updateProgress()
		}

		img.onerror = function () {
			handleProcessingError(url, "Failed to load image due to CORS policy or other issues.")
		}
		img.src = encodeURI(url)
	}

	// Handles errors during image processing
	function handleProcessingError(item, message) {
		console.error(`${item} - ${message}`)
		failedImages.push(item)
		displayErrorMessage(item, message)
		showErrorModal(message)
		modal.classList.add("hidden")
	}

	// Resizes the image and stores it in the ZIP archive
	function resizeAndStoreImage(dataUrl, fileName, resizeWidth, resizeHeight, prefix, format, index, totalFiles) {
		const img = new Image()
		img.onload = function () {
			const canvas = document.createElement("canvas")
			const ctx = canvas.getContext("2d")

			if (resizeWidth) {
				canvas.width = resizeWidth
				canvas.height = img.height * (resizeWidth / img.width)
			} else if (resizeHeight) {
				canvas.height = resizeHeight
				canvas.width = img.width * (resizeHeight / img.height)
			}

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
			canvas.toBlob(function (blob) {
				const extension = format === "jpeg" ? "jpg" : format
				const newFileName = `${prefix ? "resized_" : ""}${fileName.replace(/\.[^/.]+$/, "")}.${extension}`
				zip.file(newFileName, blob, { binary: true })
				resizedImages.push({ url: URL.createObjectURL(blob), name: newFileName })

				resizedCount++
				updateProgress()
			}, `image/${format}`)
		}
		img.onerror = function () {
			handleProcessingError(fileName, "Failed to process image from data URL.")
		}
		img.src = dataUrl
	}

	// Gets a data URL from an image element
	function getDataUrlFromImage(image, format) {
		const canvas = document.createElement("canvas")
		canvas.width = image.width
		canvas.height = image.height
		const ctx = canvas.getContext("2d")
		ctx.drawImage(image, 0, 0)
		return canvas.toDataURL(`image/${format}`)
	}

	// Updates the progress bar and handles completion
	function updateProgress() {
		const progress = Math.round(((loadedCount + resizedCount) / (totalFiles * 2)) * 100)
		progressBar.style.width = `${progress}%`
		progressText.textContent = `${progress}%`

		if (loadedCount + resizedCount === totalFiles * 2) {
			if (failedImages.length === 0) {
				setTimeout(() => {
					displayImages()
					modal.classList.add("hidden")
					downloadZipBtn.classList.remove("hidden")
					resetResizingState()
				}, 100)
			}
		}
	}

	// Displays the error modal with failed images
	function showErrorModal(message) {
		errorModal.classList.remove("hidden")
		errorFileList.innerHTML = failedImages.map((file) => `<li>${file}<br><p><i class="fa-solid fa-circle-exclamation"></i> ${message}</li><p>`).join("")
		isResizing = false
		resizeBtn.disabled = false
		fileInput.disabled = false
		imageUrls.disabled = false
		resizeWidthInput.disabled = false
		resizeHeightInput.disabled = false
		prefixCheckbox.disabled = false
		formatSelect.disabled = false
		modal.classList.add("hidden")
	}

	// Resets the state after resizing is complete
	function resetResizingState() {
		resizeBtn.disabled = false
		fileInput.disabled = false
		imageUrls.disabled = false
		resizeWidthInput.disabled = false
		resizeHeightInput.disabled = false
		prefixCheckbox.disabled = false
		formatSelect.disabled = false
		isResizing = false
	}
}

// Displays resized images in the UI
function displayImages() {
	resizedImagesSection.classList.remove("hidden")
	imageGrid.innerHTML = ""
	resizedImages.forEach(({ url, name }) => {
		const imgContainer = document.createElement("div")
		imgContainer.className = "masonry-item"

		const imgElement = document.createElement("img")
		imgElement.src = url

		const downloadBtn = document.createElement("button")
		downloadBtn.textContent = "Download"
		downloadBtn.onclick = () => {
			const a = document.createElement("a")
			a.href = url
			a.download = name
			a.click()
		}

		const actionsDiv = document.createElement("div")
		actionsDiv.className = "image-actions"
		actionsDiv.appendChild(downloadBtn)

		imgContainer.appendChild(imgElement)
		imgContainer.appendChild(actionsDiv)
		imageGrid.appendChild(imgContainer)
	})
}

// Downloads all resized images as a ZIP file
function downloadZip() {
	const zip = new JSZip()
	const promises = resizedImages.map(({ url, name }) =>
		fetch(url)
			.then((res) => res.blob())
			.then((blob) => zip.file(name, blob))
	)

	Promise.all(promises).then(() => {
		zip.generateAsync({ type: "blob" }).then((content) => {
			const a = document.createElement("a")
			a.href = URL.createObjectURL(content)
			a.download = "resized_images.zip"
			a.click()
		})
	})
}

// Reloads the page to reset all state
function resetAll() {
	window.location.reload()
}

// Displays an error message in the error modal
function displayErrorMessage(item, message) {
	errorModal.classList.remove("hidden")
	errorFileList.innerHTML += `<li>${item} - ${message}</li>`
}

// Closes the error modal
document.getElementById("closeError").addEventListener("click", () => {
	errorModal.classList.add("hidden")
	errorFileList.innerHTML = ""
})
