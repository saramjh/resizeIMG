## Online Image Resizer
<center>
![preview](https://github.com/user-attachments/assets/b5d6bca8-b9a4-4fdd-8aa2-c218b4e91cd0)
</center>

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
