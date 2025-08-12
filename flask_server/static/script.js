document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const uploadText = document.getElementById('uploadText');
    const previewContainer = document.getElementById('previewContainer');
    const classifyBtn = document.getElementById('classifyBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultText = document.getElementById('resultText');
    const resultImage = document.getElementById('resultImage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const dropArea = document.getElementById('dropArea');
    const tryAgainBtn = document.getElementById('tryAgainBtn');

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('highlight');
    }

    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        if (file && file.type.match('image.*')) {
            handleFile(file);
        } else {
            showError('Please select an image file');
        }
    }

    // Handle file selection
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    function handleFile(file) {
        // Display preview
        const reader = new FileReader();
        reader.onload = function(event) {
            previewContainer.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
            uploadText.textContent = 'Image ready for recognition';
            uploadText.style.color = '#046A38';
            uploadText.style.fontWeight = 'bold';
            classifyBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // Handle classify button click
    classifyBtn.addEventListener('click', async function() {
        const file = imageInput.files[0];
        if (!file) return;

        // Show loading spinner
        loadingSpinner.classList.remove('hidden');
        resultContainer.classList.add('hidden');

        try {
            // Convert image to base64
            const base64 = await toBase64(file);
            
            // Send to Flask API
            const response = await fetch('/classify_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64 })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Display result
            resultText.textContent = data.result || 'Could not recognize';
            resultImage.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Result">`;
            resultContainer.classList.remove('hidden');
        } catch (error) {
            resultText.textContent = `Error: ${error.message}`;
            resultContainer.classList.remove('hidden');
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });

    // Try again button
    tryAgainBtn.addEventListener('click', function() {
        imageInput.value = '';
        previewContainer.innerHTML = '';
        uploadText.textContent = 'Drag & drop image or click to browse';
        uploadText.style.color = '';
        uploadText.style.fontWeight = '';
        classifyBtn.disabled = true;
        resultContainer.classList.add('hidden');
    });

    // Convert file to base64 (without data URL prefix)
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove the data URL prefix
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    }

    function showError(message) {
        alert(message); // Or implement a better error display
    }
});