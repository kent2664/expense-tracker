document.querySelector("#expenseForm").addEventListener("submit", function (e) {
    console.log("expense form submitted");
    e.preventDefault();
    const saveData = {};
    const saveDataArray = JSON.parse(localStorage.getItem("expenseLists")) ? JSON.parse(localStorage.getItem("expenseLists")) : [];
    // Get form elements
    const expenseForm = document.getElementById("expenseForm");
    const amountInput = expenseForm.querySelector('input[type="number"]');
    const discriptionInput = expenseForm.querySelector('textarea[name="discription"]');
    const categoryInput = expenseForm.querySelector('button.active>p');
    const dateInput = expenseForm.querySelector('input[type="date"]');

    if (e.submitter.textContent === "Save") {
        //set values to saveData object
        saveData.expense = amountInput.value;
        saveData.discription = discriptionInput.value;
        saveData.category = categoryInput ? categoryInput.textContent : null;
        saveData.date = dateInput.value;

        saveDataArray.push(saveData);
        // console.log("thisisthisishi" + saveDataArray);
        // Save to localStorage
        localStorage.setItem("expenseLists", JSON.stringify(saveDataArray));
        console.log("Saved Data:", JSON.parse(localStorage.getItem("expenseLists")) );
    }

    // console.log("Date:", dateInput.value);

    // console.log("Category:", categoryInput ? categoryInput.textContent : "No category selected");
    // console.log("Amount:", amountInput.value);
    // console.log("Description:", discriptionInput.value);

  


});

document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", function (e) {
        document.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        e.target.classList.toggle("active");
    });
});