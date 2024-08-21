JavaScript 코드를 분석하여 애플리케이션의 기능과 동작 방식을 이해했습니다. 이 코드는 사용자가 이미지를 업로드하거나 URL을 입력하여 이미지를 리사이즈하고, 그 결과를 다운로드할 수 있는 웹 애플리케이션을 구현합니다.

### 분석된 기능

1. **이미지 선택 및 URL 입력**:

   - 사용자는 로컬 파일을 선택하거나 이미지 URL을 입력하여 이미지 리스트를 생성합니다.
   - 입력된 파일과 URL을 검증하여 올바른 이미지 파일인지 확인합니다.

2. **리사이즈 옵션**:

   - 사용자가 입력한 너비와 높이 값을 기반으로 이미지를 리사이즈할 수 있습니다. 비율에 맞게 크기를 자동 조정합니다.
   - 이미지 포맷(JPG, PNG, GIF, WEBP)과 파일 이름에 접두사를 추가하는 옵션을 설정할 수 있습니다.

3. **이미지 처리**:

   - 로컬 파일과 URL로부터 이미지를 읽어와 리사이즈합니다.
   - 리사이즈된 이미지를 ZIP 파일로 압축하거나 화면에 표시합니다.
   - 처리 도중 오류가 발생하면 에러 메시지를 표시합니다.

4. **진행 상태 및 결과 표시**:

   - 리사이즈 진행 상황을 시각적으로 보여주는 진행 바와 상태 텍스트를 업데이트합니다.
   - 리사이즈가 완료된 후, 이미지를 화면에 표시하고 다운로드 링크를 제공합니다.
   - 오류가 발생한 경우, 에러 모달을 통해 사용자에게 오류 정보를 제공합니다.

5. **ZIP 다운로드**:

   - 리사이즈된 이미지를 ZIP 파일로 다운로드할 수 있는 기능을 제공합니다.

6. **리셋 기능**:
   - 모든 상태를 초기화하고 페이지를 새로 고침하여 초기 상태로 돌아갈 수 있습니다.

## Online Image Resizer

An easy-to-use online tool for resizing images while maintaining their aspect ratio. Upload images or provide URLs to resize, then download the resized images or get them as a ZIP file.

### Features

- **Upload Images**: Select multiple image files or enter image URLs.
- **Resize Options**: Define width and height, select image format (JPG, PNG, GIF, WEBP), and optionally add a prefix to filenames.
- **Progress Tracking**: See the progress of the resizing operation.
- **Error Handling**: View error messages if any images fail to process.
- **Download Resized Images**: Download resized images individually or as a ZIP file.
- **Reset Functionality**: Clear all selections and settings to start over.

### How to Use

1. **Select Images or Enter URLs**:

   - Click the file input to select local images or enter image URLs in the provided text area.

2. **Set Resize Options**:

   - Input the desired width and height. You can choose to keep one dimension fixed to maintain the aspect ratio.
   - Choose the desired format for the resized images.
   - Optionally, check the box to add a "resized\_" prefix to filenames.

3. **Resize Images**:

   - Click the "Resize Images" button to start the resizing process.
   - The progress will be displayed, and once completed, resized images will be shown.

4. **Download Results**:

   - Click the "Download All as ZIP" button to download all resized images in a single ZIP file.
   - Alternatively, click the "Download" button below each image to download it individually.

5. **Reset All**:
   - Click the "Reset All" button to clear all inputs and selections and reload the page.

### Error Handling

If any errors occur during the image processing, an error modal will display the issue and list any failed images. You can close this modal to return to the application.

### Dependencies

- **JSZip**: Used to create ZIP files for downloading resized images.
- **Font Awesome**: Provides icons used in the interface.
- **Google Analytics**: Tracks usage statistics (optional).

### Contributing

Feel free to fork the repository and submit pull requests. For feature requests or bug reports, please use the issue tracker on [GitHub](https://github.com/saramjh/resizeIMG).

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
