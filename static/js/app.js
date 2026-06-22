// Scroll on clicking hero buttons
const formInput = document.getElementById('form-head');
const predBtn = document.getElementById('hero-pred');

// Scrolls to prediction form
predBtn.addEventListener("click", () => {
    formInput.scrollIntoView({ behavior: "smooth", block: "start" });
});

const market = document.getElementById('market-section');
const marketBtn = document.getElementById('hero-market');

// Scrolls to stock market chart
marketBtn.addEventListener("click", () => {
    market.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Conversion of date from input form to valid model input format
const changeDateFormat = (inputDateStr) => {
    let dateObj = new Date(inputDateStr);
    let formattedDate = new Intl.DateTimeFormat('en-GB').format(dateObj);
    let finalResult = formattedDate.replace(/\//g, '-');
    return finalResult;
}

// Conversion of date from model output format to user readable format
function formatPredictionDate(dateStr) {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const day = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const year = parts[2];
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    
    const monthName = months[monthIndex];
    if (!monthName) return dateStr;

    return `${monthName} ${day}, ${year}`;
}

    const fDate = document.getElementById('future_date');
    const Tick = document.getElementById('company_name');
    const sDate = document.getElementById('start_year');
    const eDate = document.getElementById('end_year');

// Custom input validation
function checkInputs() {

    const dateValue = fDate.value;
    const tickerValue = Tick.value;
    const startDateValue = sDate.value;
    const endDateValue = eDate.value;

    let inputList = [
        { element: Tick, value: tickerValue },
        { element: sDate, value: startDateValue },
        { element: eDate, value: endDateValue }
    ];

    let isFormValid = true;
    inputList.forEach(item => {
        if (item.value === '' || item.value === null) {
            setErrorFor(item.element);
            isFormValid = false;
        } else {
            setSuccessFor(item.element);
        }
    });
    if (!isProperDate(dateValue)) {
        setErrorFor(fDate);
        isFormValid = false;
    } else {
        setSuccessFor(fDate);
    }
    if (!isFormValid) {
        return false; 
    }
    return true;
}

// Error and Success Events
function setErrorFor(input, message) {
    input.style.borderColor = 'var(--danger)';
    return false;
}

function setSuccessFor(input) {
    input.style.borderColor = 'var(--border)';
    return true;
}

const isProperDate = (dVal) => /^(?=.)(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:0?[1-9]|[12][0-9]|3[01]|(?:0?1|21|31)st|(?:0?2|22)nd|(?:0?3|23)rd|(?:0?[4-9]|1[0-9]|2[4-9]|30)th),\s+\d{4}$/.test(dVal);

// Prediction form actions
const predictionForm = document.getElementById('prediction-form');
predictionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!checkInputs()) return;
    const submitBtn = document.getElementById('p-form-btn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.364 5.63604L16.9497 7.05025C15.683 5.7835 13.933 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12H21C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604Z"></path></svg>`;

    const company_name = document.getElementById('company_name').value;
    const start_year = document.getElementById('start_year').value;
    const end_year = document.getElementById('end_year').value;
    const date = document.getElementById('future_date').value;
    const future_date = changeDateFormat(date);

    try {
        await predictStock(company_name, start_year, end_year, future_date);
    } catch (err) {
        console.error(err);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        fDate.value = '';
        Tick.value = '';
    }
})

// Prediction functionality from python api
async function predictStock(company_name, start_year, end_year, future_date) {

    const container = document.getElementById('prediction-container');

    try {
        const res = await fetch("/results", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_name: company_name,
                start_year: start_year,
                end_year: end_year,
                future_date: future_date
            })
        });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok) {
            const text = await res.text();
            console.error('Server returned error:', res.status, text);
            return;
        }
        if (!contentType.includes('application/json')) {
            const text = await res.text();
            console.error('Expected JSON but got:', text);
            return;
        }
        const data = await res.json();
        if (data.error) {
            console.error('Prediction error:', data.error);
            return;
        }

        const isUp = data.movement === "UP";
        const colorStyle = isUp ? '' : 'style="color: var(--danger);"';
        const svgStyle = isUp ? '' : 'style="fill: var(--danger);"';
        const sign = isUp ? '+' : '-';
        const svgPath = isUp ? '<path d="M12 8L18 14H6L12 8Z"></path>' : '<path d="M12 16L6 10H18L12 16Z"></path>';
        const newDate = formatPredictionDate(data.future_date);

        container.innerHTML = `
        <div class="future-data">
            <div class="company">
                <p class="company-name">${data.company_fullname || data.company_name || 'N/A'}</p>
                <p>${data.company_name || 'N/A'}</p>
            </div>
            <div class="data">
                <h1>$${data.predicted_price || 'N/A'}</h1>
                <div class="extra">
                    <div class="change">
                        <p ${colorStyle}>${data.percentage_change || 'N/A'}%</p>
                        <svg ${svgStyle} xmlns="http://w3.org" viewBox="0 0 24 24" fill="currentColor">${svgPath}</svg>
                    </div>
                    <p>${newDate || 'N/A'}</p>
                </div>
            </div>
        </div>
        `

    } catch (error) {
        container.innerHTML = `<section>
            <div class="error-panel">
                <h2>Prediction unavailable</h2>
                <p>{{ result.error }}</p>
            </div>
        </section>`

    }
}