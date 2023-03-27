let currentQuestionIdx = 0;
showQuestion(currentQuestionIdx);

function showQuestion(questionIdx) {

    let questions = document.getElementsByClassName("tab");

    questions[questionIdx].style.display = "block";

    if (questionIdx === 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }

    if (questionIdx === questions.length - 1) {
        document.getElementById("nextBtn").style.display = "none";
    } else {
        document.getElementById("nextBtn").style.display = "inline";
    }

    fixStepIndicator(questionIdx)

}

function incrementQuestion(n) {

    let questions = document.getElementsByClassName("tab");

    // Return so that the form does not go to the next page
    if (n === 1 && !formIsValid()){
        return;
    }

    // Stops displaying the current question:
    questions[currentQuestionIdx].style.display = "none";

    // Increment or decrement the current tab by 1:
    currentQuestionIdx += n;

    // Display the tab at that index:
    showQuestion(currentQuestionIdx);
}

function formIsValid() {

    let isValid = true;
    let questions = document.getElementsByClassName("tab");
    let inputBoxesOfCurrentQuestion = questions[currentQuestionIdx].getElementsByTagName("input");

    // A loop that checks every input field in the current tab:
    for (let i = 0; i < inputBoxesOfCurrentQuestion.length; i++) {

        // If a field is empty...
        if (inputBoxesOfCurrentQuestion[i].value === "") {

            inputBoxesOfCurrentQuestion[i].className = "invalid";
            isValid = false;

        } else {

            inputBoxesOfCurrentQuestion[i].className = "";

        }

    }

    return isValid;
}

function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    let i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class to the current step:
    x[n].className += " active";
}

let previewBtn = document.getElementById("previewBtn");

previewBtn.addEventListener("click", () => {

    let responseTable = document.getElementById("previewResponseTable");

    responseTable.replaceChildren();

    let inputBoxes = document.getElementsByTagName("input");

    let tableHeaderRow = document.createElement("tr");
    let tableHeader1 = document.createElement("th");
    let tableHeader2 = document.createElement("th");

    tableHeader1.textContent = "Questions";
    tableHeader2.textContent = "Responses";

    tableHeaderRow.appendChild(tableHeader1);
    tableHeaderRow.appendChild(tableHeader2);

    responseTable.appendChild(tableHeaderRow);

    for (let i = 0; i < inputBoxes.length; i++) {

        let tableRow = document.createElement("tr");
        let questionNum = document.createElement("td");
        let questionData = document.createElement("td");

        questionNum.textContent = "Question " + (i + 1);
        questionData.textContent = inputBoxes[i].value;

        tableRow.appendChild(questionNum);
        tableRow.appendChild(questionData);

        responseTable.appendChild(tableRow);

    }

})
