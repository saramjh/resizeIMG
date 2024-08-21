let resizedImages = []
let failedImages = [] // 리사이즈 실패한 이미지들을 저장할 배열
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
const formatSelect = document.getElementById("formatSelect")
const errorModal = document.getElementById("errorModal")
const errorFileList = document.getElementById("errorFileList")
const imageUrls = document.getElementById("imageUrls")

// 이벤트 리스너 추가
fileInput.addEventListener("change", updateFileList)
imageUrls.addEventListener("input", updateFileList)
resizeWidthInput.addEventListener("input", handleDimensionInput)
resizeHeightInput.addEventListener("input", handleDimensionInput)

function updateFileList() {
	const files = Array.from(fileInput.files).filter((file) => isImageFile(file))
	const urls = imageUrls.value.split("\n").filter(Boolean)

	fileListContainer.innerHTML = ""

	// 리사이즈 대상이 없을 경우 경고 메시지 표시
	if (files.length === 0 && urls.length === 0) {
		alert("No valid image files or URLs found. Please add at least one image or URL.")
		return
	}

	const fileListUl = document.createElement("ul")

	// 로컬 파일 처리
	Array.from(files).forEach((file, index) => {
		if (isImageFile(file)) {
			const listItem = document.createElement("li")
			listItem.innerHTML = `
                <input type="checkbox" id="file-${index}" checked>
                <label for="file-${index}">${file.name}</label>
            `
			fileListUl.appendChild(listItem)
		} else {
			displayErrorMessage(file.name, "Not an image file") // 에러 메시지 표시
		}
	})

	// URL 처리
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
			displayErrorMessage(url, "Invalid URL format") // 에러 메시지 표시
		}
	})

	fileListContainer.appendChild(fileListUl)
}

function isImageFile(file) {
	return file && /image\/(jpg|jpeg|png|gif)/i.test(file.type)
}

function isValidImageUrl(url) {
	// URL을 인코딩하여 한글이 포함된 URL도 처리 가능하도록 수정
	const encodedUrl = encodeURI(url)
	return (encodedUrl.startsWith("http://") || encodedUrl.startsWith("https://")) && /\.(jpg|jpeg|png|gif|webp|tiff)$/i.test(encodedUrl)
}

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

function resizeImages() {
	if (isResizing) return

	const resizeWidth = parseInt(resizeWidthInput.value, 10)
	const resizeHeight = parseInt(resizeHeightInput.value, 10)
	const prefix = prefixCheckbox.checked
	const format = formatSelect.value.toLowerCase() // 선택한 포맷

	if (!resizeWidth && !resizeHeight) {
		alert("Please enter at least one dimension.")
		return
	}

	const files = Array.from(fileInput.files).filter((file) => isImageFile(file))
	const urls = imageUrls.value.split("\n").filter(Boolean)

	// 리사이즈할 파일이 체크된 것만 선택
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
	formatSelect.disabled = true // 포맷 선택 비활성화

	modal.classList.remove("hidden")
	let loadedCount = 0
	let resizedCount = 0
	const totalFiles = checkedFiles.length + checkedUrls.length
	const zip = new JSZip()

	resizedImages = [] // 이전에 리사이즈된 이미지 초기화
	failedImages = [] // 실패한 이미지 초기화

	// 로컬 파일 처리
	checkedFiles.forEach((file, index) => {
		processImageFile(file, index, totalFiles, resizeWidth, resizeHeight, prefix, format)
	})

	// URL 처리
	checkedUrls.forEach((url, index) => {
		processImageUrl(url, index + checkedFiles.length, totalFiles, resizeWidth, resizeHeight, prefix, format)
	})

	function processImageFile(file, index, totalFiles, resizeWidth, resizeHeight, prefix, format) {
		const reader = new FileReader()
		reader.onload = function (event) {
			resizeAndStoreImage(event.target.result, file.name, resizeWidth, resizeHeight, prefix, format, index, totalFiles)
			loadedCount++
			updateProgress()
		}
		reader.onerror = function (event) {
			const errorMessage = event.target.error.message // 발생한 에러 메시지를 가져옵니다.
			handleProcessingError(file.name, errorMessage) // 에러 메시지를 전달합니다.
		}
		reader.readAsDataURL(file)
	}

	function processImageUrl(url, index, totalFiles, resizeWidth, resizeHeight, prefix, format) {
		const img = new Image()
		img.crossOrigin = "anonymous" // CORS 문제 해결

		img.onload = function () {
			const fileName = decodeURIComponent(url.substring(url.lastIndexOf("/") + 1)) || `image-${index}.${format}` // 한글 파일명 디코딩
			const dataUrl = getDataUrlFromImage(img, format)
			resizeAndStoreImage(dataUrl, fileName, resizeWidth, resizeHeight, prefix, format, index, totalFiles)
			loadedCount++
			updateProgress()
		}

		img.onerror = function () {
			handleProcessingError(url, "Failed to load image due to CORS policy or other issues.")
		}
		img.src = encodeURI(url) // URL을 인코딩하여 로드
	}

	function handleProcessingError(item, message) {
		console.error(`${item} - ${message}`)
		failedImages.push(item) // 실패한 항목 저장
		displayErrorMessage(item, message) // 에러 메시지 표시
		showErrorModal(message) // 에러 모달 표시
		modal.classList.add("hidden")
	}

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
				const extension = format === "jpeg" ? "jpg" : format // 'jpeg'을 'jpg'로 변경
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

	function getDataUrlFromImage(image, format) {
		const canvas = document.createElement("canvas")
		canvas.width = image.width
		canvas.height = image.height
		const ctx = canvas.getContext("2d")
		ctx.drawImage(image, 0, 0)
		return canvas.toDataURL(`image/${format}`)
	}

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

	function showErrorModal(message) {
		errorModal.classList.remove("hidden")
		errorFileList.innerHTML = failedImages.map((file) => `<li>${file}<br><p><i class="fa-solid fa-circle-exclamation"></i> ${message}</li><p>`).join("")
		// 리사이즈 중단 후 상태 초기화
		isResizing = false
		resizeBtn.disabled = false
		fileInput.disabled = false
		imageUrls.disabled = false
		resizeWidthInput.disabled = false
		resizeHeightInput.disabled = false
		prefixCheckbox.disabled = false
		formatSelect.disabled = false // 포맷 선택 활성화
		modal.classList.add("hidden")
	}

	function resetResizingState() {
		resizeBtn.disabled = false
		fileInput.disabled = false
		imageUrls.disabled = false
		resizeWidthInput.disabled = false
		resizeHeightInput.disabled = false
		prefixCheckbox.disabled = false
		formatSelect.disabled = false // 포맷 선택 활성화
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

		const actionsDiv = document.createElement("div")
		actionsDiv.className = "image-actions"
		actionsDiv.appendChild(downloadBtn)

		imgContainer.appendChild(imgElement)
		imgContainer.appendChild(actionsDiv)
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
		zip.generateAsync({ type: "blob" }).then((content) => {
			const a = document.createElement("a")
			a.href = URL.createObjectURL(content)
			a.download = "resized_images.zip"
			a.click()
		})
	})
}

function resetAll() {
	window.location.reload() // 페이지 새로 고침
}

function displayErrorMessage(item, message) {
	// 에러 모달을 표시하고, 에러 리스트를 업데이트합니다.
	errorModal.classList.remove("hidden")
	errorFileList.innerHTML += `<li>${item} - ${message}</li>` // 파일 이름과 에러 메시지를 함께 표시합니다.
}

document.getElementById("closeError").addEventListener("click", () => {
	errorModal.classList.add("hidden")
	errorFileList.innerHTML = ""
})
