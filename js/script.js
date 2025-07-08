const seriesList = ["The Apothecary Diaries"];
const mediaTypes = [
    { label: "Anime", value: "Anime" },
    { label: "Manga", value: "Manga" },
    { label: "Light Novel", value: "LN" }
];

const input = document.getElementById('inputbox');
const dropdown = document.getElementById('dropdown');
const mainDiv = document.querySelector('.main');

// Helper to create dropdown
function createDropdown(options, onSelect, selectedValue) {
    const dd = document.createElement('div');
    dd.className = 'dropdown';
    options.forEach(opt => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.textContent = opt.label;
        if (selectedValue && selectedValue === opt.value) {
            option.style.fontWeight = 'bold';
        }
        option.onclick = () => onSelect(opt);
        dd.appendChild(option);
    });
    return dd;
}

// Step 1: Series search
input.addEventListener('input', function() {
    const value = input.value.trim().toLowerCase();
    dropdown.innerHTML = '';
    if (value === '') {
        dropdown.style.display = 'none';
        return;
    }
    const filtered = seriesList.filter(series =>
        series.toLowerCase().includes(value)
    );
    if (filtered.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    filtered.forEach(series => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.textContent = series;
        option.onclick = () => {
            input.value = series;
            dropdown.style.display = 'none';
            showNextButton(series);
        };
        dropdown.appendChild(option);
    });
    dropdown.style.display = 'block';
});

// Hide dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Show Next button
function showNextButton(series) {
    let nextBtn = document.getElementById('next-btn');
    if (!nextBtn) {
        nextBtn = document.createElement('button');
        nextBtn.id = 'next-btn';
        nextBtn.textContent = 'Next';
        nextBtn.className = 'next-btn';
        mainDiv.appendChild(nextBtn);
    }
    nextBtn.style.display = 'block';
    nextBtn.onclick = () => {
        // Fade out mainDiv, then show dual inputs
        mainDiv.classList.add('fade-out');
        setTimeout(() => {
            mainDiv.classList.remove('fade-out');
            showDualInputs(series);
        }, 500);
    };
}

// Step 2: Show dual input boxes and dropdowns
function showDualInputs(series) {
    input.style.display = 'none';
    dropdown.style.display = 'none';
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    // Remove previous dualDiv if exists
    let dualDiv = document.getElementById('dual-inputs');
    if (dualDiv) dualDiv.remove();
    dualDiv = document.createElement('div');
    dualDiv.id = 'dual-inputs';
    dualDiv.style.display = 'flex';
    dualDiv.style.gap = '20px';
    dualDiv.style.marginTop = '20px';

    // Left input and dropdown
    const leftDiv = document.createElement('div');
    leftDiv.className = 'dual-col';

    // Left select
    const leftSelect = document.createElement('select');
    leftSelect.className = 'media-select';
    mediaTypes.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        leftSelect.appendChild(option);
    });

    // Left input
    const leftInput = document.createElement('input');
    leftInput.type = 'text';
    leftInput.placeholder = 'Enter episode number...';
    leftInput.id = 'left-episode-input';
    leftInput.className = 'dual-input';

    leftSelect.onchange = function() {
        if (leftSelect.value === "Anime") {
            leftInput.placeholder = "Enter episode number...";
            leftInput.disabled = false;
        } else {
            leftInput.placeholder = "Enter chapter/volume...";
            leftInput.disabled = false;
        }
    };

    leftDiv.appendChild(leftSelect);
    leftDiv.appendChild(leftInput);

    // Submit button (now inside leftDiv)
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    submitBtn.className = 'dual-submit';
    submitBtn.style.marginLeft = '0';
    submitBtn.style.marginTop = '16px';
    submitBtn.onclick = async function() {
        // Build file path
        const leftVal = leftSelect.value;
        const rightVal = rightSelect.value;
        const leftValForFile = leftVal === "LN" ? "LN" : leftVal;
        const rightValForFile = rightVal === "LN" ? "LN" : rightVal;
        const filePath = `assets/${series},${leftValForFile};${rightValForFile}.txt`;

        let searchKey = "";
        if (leftVal === "Anime") {
            const epNum = leftInput.value.trim();
            if (!epNum) {
                alert("Please enter an episode number.");
                return;
            }
            searchKey = `Episode ${epNum}`;
        } else {
            searchKey = leftInput.value.trim();
        }

        // Fetch and parse file
        try {
            const resp = await fetch(filePath);
            if (!resp.ok) throw new Error("File not found");
            const text = await resp.text();
            const lines = text.split('\n');
            let found = "";
            for (const line of lines) {
                if (line.startsWith(searchKey + ",")) {
                    found = line.split(',').slice(1).join(',').trim();
                    break;
                }
            }
            if (found) {
                rightInput.value = found;
            } else {
                rightInput.value = "Not found";
            }
        } catch (e) {
            rightInput.value = "File not found";
        }
    };
    leftDiv.appendChild(submitBtn);

    // Right input and dropdown
    const rightDiv = document.createElement('div');
    rightDiv.className = 'dual-col';

    // Right select
    const rightSelect = document.createElement('select');
    rightSelect.className = 'media-select';
    mediaTypes.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        rightSelect.appendChild(option);
    });
    rightSelect.selectedIndex = 2; // Default to Light Novel

    // Right input
    const rightInput = document.createElement('input');
    rightInput.type = 'text';
    rightInput.readOnly = true;
    rightInput.id = 'right-output-input';
    rightInput.className = 'dual-input';

    rightDiv.appendChild(rightSelect);
    rightDiv.appendChild(rightInput);

    // Go Back button (now inside rightDiv)
    let backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.remove();
    backBtn = document.createElement('button');
    backBtn.id = 'back-btn';
    backBtn.textContent = 'Go Back';
    backBtn.className = 'dual-submit';
    backBtn.style.background = '#e11d48';
    backBtn.style.marginLeft = '0';
    backBtn.style.marginTop = '16px';
    backBtn.onclick = () => {
        mainDiv.classList.add('fade-out');
        setTimeout(() => {
            mainDiv.classList.remove('fade-out');
            resetToSeriesSelection();
        }, 500);
    };
    rightDiv.appendChild(backBtn);

    dualDiv.appendChild(leftDiv);
    dualDiv.appendChild(rightDiv);
    mainDiv.appendChild(dualDiv);
}

// Helper to reset UI to series selection
function resetToSeriesSelection() {
    // Remove dual inputs and buttons
    let dualDiv = document.getElementById('dual-inputs');
    if (dualDiv) dualDiv.remove();
    let submitBtn = document.querySelector('.dual-submit');
    if (submitBtn) submitBtn.remove();
    let backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.remove();

    input.value = '';
    input.style.display = 'block';
    dropdown.innerHTML = '';
    dropdown.style.display = 'none';
    input.focus();
}