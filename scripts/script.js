let resizedImages = []
let isResizing = false
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

document.getElementById("fileInput").addEventListener("change", updateFileList)
document.getElementById("imageUrls").addEventListener("input", updateFileList)

function updateFileList() {
	const files = fileInput.files
	const urls = document.getElementById("imageUrls").value.split("\n").filter(Boolean)

	fileListContainer.innerHTML = ""

	if (files.length === 0 && urls.length === 0) return

	const fileListUl = document.createElement("ul")

	// 로컬 파일 처리
	Array.from(files).forEach((file, index) => {
		const listItem = document.createElement("li")
		listItem.innerHTML = `
			<input type="checkbox" id="file-${index}" checked>
			<label for="file-${index}">${file.name}</label>
		`
		fileListUl.appendChild(listItem)
	})

	// URL 처리
	urls.forEach((url, index) => {
		const urlIndex = index + files.length
		const listItem = document.createElement("li")
		listItem.innerHTML = `
			<input type="checkbox" id="file-${urlIndex}" checked>
			<label for="file-${urlIndex}">${url}</label>
		`
		fileListUl.appendChild(listItem)
	})

	fileListContainer.appendChild(fileListUl)
}

function resizeImages() {
	if (isResizing) return

	const resizeWidth = parseInt(resizeWidthInput.value, 10)
	const resizeHeight = parseInt(resizeHeightInput.value, 10)
	const prefix = prefixCheckbox.checked

	if (!resizeWidth && !resizeHeight) {
		alert("Please enter at least one dimension.")
		return
	}

	isResizing = true
	resizeBtn.disabled = true
	fileInput.disabled = true
	resizeWidthInput.disabled = true
	resizeHeightInput.disabled = true
	prefixCheckbox.disabled = true

	modal.style.display = "flex" // 모달 표시
	let processedCount = 0
	const files = Array.from(fileInput.files)
	const urls = document.getElementById("imageUrls").value.split("\n").filter(Boolean)
	const totalFiles = files.length + urls.length
	const zip = new JSZip()

	resizedImages = [] // 이전에 리사이즈된 이미지 초기화

	// 로컬 파일 처리
	files.forEach((file, index) => {
		if (document.getElementById(`file-${index}`).checked) {
			processImageFile(file, index, totalFiles, resizeWidth, resizeHeight, prefix)
		} else {
			processedCount++
		}
	})

	// URL 처리
	urls.forEach((url, index) => {
		const urlIndex = index + files.length
		if (document.getElementById(`file-${urlIndex}`).checked) {
			processImageUrl(url, urlIndex, totalFiles, resizeWidth, resizeHeight, prefix)
		} else {
			processedCount++
		}
	})

	function processImageFile(file, index, totalFiles, resizeWidth, resizeHeight, prefix) {
		const reader = new FileReader()
		reader.onload = function (event) {
			resizeAndStoreImage(event.target.result, file.name, resizeWidth, resizeHeight, prefix, index, totalFiles)
		}
		reader.readAsDataURL(file)
	}

	function processImageUrl(url, index, totalFiles, resizeWidth, resizeHeight, prefix) {
		const img = new Image()
		img.crossOrigin = "anonymous" // CORS 문제 해결

		img.onload = function () {
			const fileName = url.substring(url.lastIndexOf("/") + 1) || `image-${index}.jpg`
			const dataUrl = getDataUrlFromImage(img)
			resizeAndStoreImage(dataUrl, fileName, resizeWidth, resizeHeight, prefix, index, totalFiles)
		}

		img.onerror = function () {
			console.error(`Failed to load image from URL: ${url}`)
			processedCount++
			updateProgress()
		}

		img.src = url

		function updateProgress() {
			const progress = Math.round((processedCount / totalFiles) * 100)
			progressBar.style.width = `${progress}%`
			progressText.textContent = `${progress}%`

			if (processedCount === totalFiles) {
				setTimeout(() => {
					displayImages()
					modal.style.display = "none" // 모달 숨기기
					downloadZipBtn.classList.remove("hidden")
					resetResizingState()
				}, 100)
			}
		}
	}

	function resizeAndStoreImage(dataUrl, fileName, resizeWidth, resizeHeight, prefix, index, totalFiles) {
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
				const newFileName = `${prefix ? "resized_" : ""}${fileName}`
				zip.file(newFileName, blob, { binary: true })
				resizedImages.push({ url: URL.createObjectURL(blob), name: newFileName })

				const progress = Math.round(((processedCount + 1) / totalFiles) * 100)
				progressBar.style.width = `${progress}%`
				progressText.textContent = `${progress}%`

				if (++processedCount === totalFiles) {
					setTimeout(() => {
						displayImages()
						modal.style.display = "none" // 모달 숨기기
						downloadZipBtn.classList.remove("hidden")
						resetResizingState()
					}, 100)
				}
			}, "image/jpeg")
		}
		img.onerror = function () {
			console.error(`Failed to process image from data URL: ${dataUrl}`)
			processedCount++
		}
		img.src = dataUrl
	}

	function getDataUrlFromImage(image) {
		const canvas = document.createElement("canvas")
		canvas.width = image.width
		canvas.height = image.height
		const ctx = canvas.getContext("2d")
		ctx.drawImage(image, 0, 0)
		return canvas.toDataURL("image/jpeg")
	}

	function resetResizingState() {
		resizeBtn.disabled = false
		fileInput.disabled = false
		resizeWidthInput.disabled = false
		resizeHeightInput.disabled = false
		prefixCheckbox.disabled = false
		isResizing = false
	}
}

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

		const imageActions = document.createElement("div")
		imageActions.className = "image-actions"
		imageActions.appendChild(downloadBtn)

		imgContainer.appendChild(imgElement)
		imgContainer.appendChild(imageActions)
		imageGrid.appendChild(imgContainer)
	})
}

function downloadZip() {
	const zip = new JSZip()
	const promises = resizedImages.map(({ url, name }) =>
		fetch(url)
			.then((res) => res.blob())
			.then((blob) => zip.file(name, blob))
	)

	Promise.all(promises).then(() => {
		zip.generateAsync({ type: "blob" }).then((blob) => {
			const link = document.createElement("a")
			link.href = URL.createObjectURL(blob)
			link.download = "resized-images.zip"
			link.click()
		})
	})
}

function resetAll() {
	fileInput.value = ""
	imageUrls.value = ""
	resizeWidthInput.value = ""
	resizeHeightInput.value = ""
	prefixCheckbox.checked = false
	fileInput.disabled = false
	resizeWidthInput.disabled = false
	resizeHeightInput.disabled = false
	prefixCheckbox.disabled = false
	fileListContainer.innerHTML = ""
	resizedImages = []
	imageGrid.innerHTML = ""
	resizedImagesSection.classList.add("hidden")
	downloadZipBtn.classList.add("hidden")
}

resizeWidthInput.addEventListener("input", toggleDisabledInput)
resizeHeightInput.addEventListener("input", toggleDisabledInput)

function toggleDisabledInput() {
	const resizeWidth = resizeWidthInput.value
	const resizeHeight = resizeHeightInput.value

	if (resizeWidth) {
		resizeHeightInput.classList.add("disabled-input")
		resizeHeightInput.placeholder = "Disabled due to aspect ratio"
	} else {
		resizeHeightInput.classList.remove("disabled-input")
		resizeHeightInput.placeholder = "Enter height"
	}

	if (resizeHeight) {
		resizeWidthInput.classList.add("disabled-input")
		resizeWidthInput.placeholder = "Disabled due to aspect ratio"
	} else {
		resizeWidthInput.classList.remove("disabled-input")
		resizeWidthInput.placeholder = "Enter width"
	}
}
