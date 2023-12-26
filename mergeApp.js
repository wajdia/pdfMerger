const selectedFiles = [];
let selectedIndex = -1;

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = 'Files to merge:';

    selectedFiles.forEach(({ file, inputIndex }, index) => {
        const listItem = document.createElement('div');
        listItem.textContent = `${index + 1}. ${file.name}`;
        if (index === selectedIndex) {
            listItem.classList.add('selected');
        }
        fileList.appendChild(listItem);
    });

    
}

function handleFileChange(event, inputIndex) {
    const fileInput = event.target;
    const files = fileInput.files;

    for (const file of files) {
        selectedFiles.push({ file, inputIndex });
    }

    updateFileList();
}

function selectFile(event) {
    const clickedIndex = Array.from(event.currentTarget.children).indexOf(event.target);
    if (clickedIndex !== -1) {
        selectedIndex = clickedIndex;
        updateFileList();
    }
}

function moveFileUp(index) {
    if (index > 0) {
        const temp = selectedFiles[index];
        selectedFiles[index] = selectedFiles[index - 1];
        selectedFiles[index - 1] = temp;
        updateFileList();
    }
}

function moveFileDown(index) {
    if (index < selectedFiles.length - 1) {
        const temp = selectedFiles[index];
        selectedFiles[index] = selectedFiles[index + 1];
        selectedFiles[index + 1] = temp;
        updateFileList();
    }
}

function moveSelectedFile(direction) {
    if (selectedIndex !== -1) {
        if (direction === 'up') {
            moveFileUp(selectedIndex);
            selectedIndex = Math.max(0, selectedIndex - 1);
        } else if (direction === 'down') {
            moveFileDown(selectedIndex);
            selectedIndex = Math.min(selectedFiles.length - 1, selectedIndex + 1);
        }
        updateFileList();
    }
}

function deleteSelectedFile() {
    if (selectedIndex !== -1) {
        selectedFiles.splice(selectedIndex, 1);
        selectedIndex = -1;
        updateFileList();
    }
}

async function mergePDFs() {
    if (selectedFiles.length < 2) {
        alert('Please select at least two PDF files.');
        return;
    }

    const pdfDoc = await PDFLib.PDFDocument.create();

    for (const { file } of selectedFiles) {
        const pdfBytes = await file.arrayBuffer();
        const existingPdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
        const copiedPages = await pdfDoc.copyPages(existingPdfDoc, existingPdfDoc.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    const mergedFileName = document.getElementById('mergedFileName').value.trim();
    const defaultFileName = 'merged';

    const finalFileName = mergedFileName || defaultFileName;

    const mergedPdfBytes = await pdfDoc.save();
    const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob);

    
    const downloadLink = document.createElement('a');
    downloadLink.href = mergedPdfUrl;
    downloadLink.download = `${finalFileName}.pdf`;
    downloadLink.click();
}