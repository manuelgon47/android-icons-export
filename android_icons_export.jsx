/**
 * Created by Manuel Gonzalez Villegas on 24/4/16.
 * Copyright © 2016 Manuel Gonzalez Villegas. All rights reserved.
 */

var iconName = "ic_launcher"
var iconSizesMap = [
	{"folder": "xxxhdpi",	"size": 192},
	{"folder": "xxhdpi",	"size": 144},
	{"folder": "xhdpi",	"size": 96},
	{"folder": "hdpi",	"size": 72},
	{"folder": "mdpi",	"size": 48}
];

/**
* Never use else. This is the reason to use multiple return
*/
function validateFile(doc) {
	if (doc.width != doc.height) {
		doc.close(SaveOptions.DONOTSAVECHANGES);
		alert("Image has to be square");

		return false;
	}
	
	if (doc.width < 1024) {
		doc.close(SaveOptions.DONOTSAVECHANGES);
		alert("The selected image should be square and equals or bigger than 1024x1024");

		return false;
	}

	return true;
}

/**
* We'll save the images for PNG-24
* See: http://jongware.mit.edu/pscs5js_html/psjscs5/pc_ExportOptionsSaveForWeb.html
*/
function getExportOptions() {
	var exportOptions = new ExportOptionsSaveForWeb();
	exportOptions.format = SaveDocumentType.PNG;
	exportOptions.PNG8 = false;
	exportOptions.transparency = true;
	exportOptions.interlaced = false;
	exportOptions.quality = 100;

	return exportOptions;
}

/**
* Iterate the map iconSizesMap to generate each icon size and store it on choosed destination folder
*/
function generateIcons(doc, destinationFolder) {
	// To restore to the initial state after each resize
	var initialState = doc.activeHistoryState;

	var icon;
	for (i = 0; i < iconSizesMap.length; i++) {
		// Get current icon
		icon = iconSizesMap[i];

		// Use method BICUBICSHARPER
		// Resample see: http://jongware.mit.edu/pscs5js_html/psjscs5/pe_ResampleMethod.html
		// Resize see: http://jongware.mit.edu/pscs5js_html/psjscs5/pc_Document.html#resizeImage
		doc.resizeImage(icon.size, icon.size, null, ResampleMethod.BICUBICSHARPER);

		var fileName = iconName + ".png";

		var currentFolder = destinationFolder + "/" + icon.folder;
		var folder = Folder(currentFolder);
		if (!folder.exists) {
			folder.create();
		}

		// Save the icon
		doc.exportDocument(new File(currentFolder + "/" + fileName), ExportType.SAVEFORWEB, getExportOptions());
		// History back to initialState
		doc.activeHistoryState = initialState;
	}
}

function main() {
	var fileRef = File.openDialog("Choose the image base (1024x1024)", "Image File:*.psd;*.png;*.jpg", false);
	if (fileRef == null) {
		alert("You exit the script");

		return;
	}

	var doc = app.open(fileRef)

	if (!validateFile(doc)) {

		return;
	}

	// Display a dialog to choose the destination folder
	var destinationFolder = Folder.selectDialog("Choose the destination folder");
	if (destinationFolder == null) {
		doc.close(SaveOptions.DONOTSAVECHANGES);
		alert("You exit the script");
		
		return;
	}

	// Mark the units to pixels
	app.preferences.rulerUnits = Units.PIXELS;

	// Remove metadata
	doc.info = null;

	// To restore to the initial state after each resize
	generateIcons(doc, destinationFolder);

	doc.close(SaveOptions.DONOTSAVECHANGES);
	alert("iOS Icons were created successfully!");
}

main();
