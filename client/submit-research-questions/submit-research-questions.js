let currentQuestionIdx = 0;
let numQuestions = 1;
showQuestion(currentQuestionIdx);

function showQuestion(questionIdx) {

    let tabTitle = document.getElementById("question-number");

    tabTitle.textContent = "Question " + (currentQuestionIdx + 1);

    let questions = document.getElementsByClassName("tab");

    questions[questionIdx].style.display = "block";

    if (questionIdx === 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }

}

function incrementQuestion(n) {

    let questions = document.getElementsByClassName("tab");

    // Return so that the form does not go to the next page
    if (n === 1 && !formIsValid()){

        return;

        // Runs if the user has filled in their last question but has clicked the next button
        // Result: new tab is created so the user can enter another question
    } else if ((n === 1) && (currentQuestionIdx + n === numQuestions)) {

        numQuestions++;

        let formElement = document.getElementById("questionForm");

        let newDivElement = document.createElement("div");
        newDivElement.className = "tab";

        let newParaElement = document.createElement("p");

        let newInputElement = document.createElement("input");
        newInputElement.setAttribute("placeholder", "Enter Question...");
        newInputElement.setAttribute("name", "question" + numQuestions);

        newParaElement.appendChild(newInputElement);
        newDivElement.appendChild(newParaElement);

        formElement.insertBefore(newDivElement, formElement.children[formElement.children.length - 2]);

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
