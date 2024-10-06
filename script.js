const inventoryCategories = [
    { name: "Coffee", items: ["Coffee 1kg", "Decaf 1kg", "Decaf 250g", "Brazil 250g", "Skipper 250g", "Colombia El Messon 250g", "Colombia piendamo 250g", "Guatemala 250g", "Peru 250g", "Ethiopia 250g", "Tanzania 250g", "Congo 250g", "Costa R 250g", "Kenya 250g", "Rwanda 250g", "Nicaragua 250g"] },
    { name: "Cups and Lids", items: ["12oz Cups Box", "12oz lids", "8oz Cups Box", "8oz lids", "Ice Cup", "Ice lids"] },
    { name: "Holders", items: ["Holder 2Cups", "Holder 4Cups"] },
    { name: "Bags", items: ["Small Handle bag", "Large Handle bag", "Pastries Bag"] },
    { name: "Napkins and Rolls", items: ["Blue Roll", "Napkins", "CC Roll", "Till Roll"] },
    { name: "Syrups", items: ["Caramel S.", "Vanilla S.", "Hazelnut S."] },
    { name: "Milk", items: ["Coconut Milk", "Oat Milk", "Almond Milk"] },
    { name: "Tea", items: ["Black Tea", "Earl Grey", "Pepper Mint", "Berry", "Lemon Ginger", "Chamolle", "Sencha Green"] },
    { name: "Other Products", items: ["Chai", "Hot Choc", "Marshmellows", "Matcha"] },
    { name: "Cleaning Products", items: ["SW Cleaner", "Profiler C.", "Puly Cleaner"] },
    { name: "Soft Drinks", items: ["Coke Origina", "Coke Zero", "Still Water", "Sparkling Water", "Vit-Hit", "Capri-Sun", "SanPellegrino Orange", "SanPellegrino Blood orange", "Sanpellegrino Lemon"] },
    { name: "Filters and Equipment", items: ["Filtropa Filter", "V60 Filter 1", "V60 Filter 2", "V60 Dripper 1", "V60 Dripper 2", "Aeropress", "Aeropress Filter", "Chemex Filter", "Bialetti Mocha"] },
    { name: "Bakery", items: ["Flapjacks", "Muffins"] },
    { name: "Miscellaneous", items: ["Fulfil CP&C", "Fulfill Choc&H", "Fulfill CB", "Brown Sugar", "Sweetner"] }
];

const payouts = [];
const foodRecords = [];
let recipes = [];
let todo = {};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize tabs
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Initialize inventory
    const inventoryList = document.getElementById('inventory-list');
    inventoryCategories.forEach(category => {
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>${category.name}</th>
                    <th>Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${category.items.map(item => `
                    <tr>
                        <td>${item}</td>
                        <td><input type="number" name="${item.toLowerCase().replace(/\s+/g, '-')}" min="0"></td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        inventoryList.appendChild(table);
    });

    // Add event listeners for new PDF generation buttons
    document.getElementById('generate-payout-pdf').addEventListener('click', generatePayoutsPDF);
    document.getElementById('generate-food-records-pdf').addEventListener('click', generateFoodRecordsPDF);
    document.getElementById('generate-recipe-pdf').addEventListener('click', generateRecipePDF);

    // Handle order submission
    document.getElementById('order-form').addEventListener('submit', handleOrderSubmit);

    // Handle payout submission
    document.getElementById('payout-form').addEventListener('submit', handlePayoutSubmit);

    // Handle food record submission
    document.getElementById('food-record-form').addEventListener('submit', handleFoodRecordSubmit);

    // Handle recipe submission
    document.getElementById('recipe-form').addEventListener('submit', handleRecipeSubmit);
});

function handleOrderSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const order = {
        date: formData.get('orderDate'),
        sign: formData.get('sign'),
        branch: formData.get('branch'),
        items: {}
    };

    formData.forEach((value, key) => {
        if (key !== 'orderDate' && key !== 'sign' && key !== 'branch' && value) {
            order.items[key] = value;
        }
    });

    const pdf = generatePDF(order);
    pdf.save("order.pdf");

    // Clear marked items from the form
    clearMarkedItems(order.items, e.target);
}

function handlePayoutSubmit(e) {
    e.preventDefault();
    const newPayout = {
        item: e.target.payoutItem.value,
        amount: e.target.payoutAmount.value,
        date: e.target.payoutDate.value,
        signed: e.target.payoutSigned.value
    };
    payouts.push(newPayout);
    renderPayouts();
    e.target.reset(); // Clear form fields after submission
}

function handleFoodRecordSubmit(e) {
    e.preventDefault();
    const newRecord = {
        date: e.target.foodDate.value,
        foodItem: e.target.foodItem.value,
        provider: e.target.foodProvider.value,
        comments: e.target.foodComments.value,
        signed: e.target.foodSigned.value
    };
    foodRecords.push(newRecord);
    renderFoodRecords();
    e.target.reset(); // Clear form fields after submission
}

function handleRecipeSubmit(e) {
    e.preventDefault();
    const newRecipe = {
        date: e.target.recipeDate.value,
        recipe: e.target.recipe.value,
        comments: e.target.recipeComments.value,
        signed: e.target.recipeSigned.value
    };

    // Add the new recipe to the array
    recipes.push(newRecipe);
    renderSavedRecipes();
    e.target.reset(); // Clear form fields after submission
}

function renderPayouts() {
    const payoutsList = document.getElementById('payouts-list');
    payoutsList.innerHTML = payouts.map((payout, index) => `
        <div 
            class="payout-item">
            <strong>Payout Item:</strong> ${payout.item}<br>
            <strong>Amount:</strong> €${payout.amount}<br>
            <strong>Date:</strong> ${payout.date}<br>
            <strong>Signed:</strong> ${payout.signed}<br>
            <button onclick="removePayout(${index})">X</button>
        </div>
    `).join('');
}

function removePayout(index) {
    payouts.splice(index, 1);
    renderPayouts();
}

function renderFoodRecords() {
    const foodRecordsList = document.getElementById('food-records-list');
    foodRecordsList.innerHTML = foodRecords.map((record, index) => `
        <li>
            <strong>Date:</strong> ${record.date}<br>
            <strong>Food Item:</strong> ${record.foodItem}<br>
            <strong>Provided by:</strong> ${record.provider}<br>
            <strong>Comments:</strong> ${record.comments}<br>
            <strong>Signed:</strong> ${record.signed}<br>
            <button onclick="removeFoodRecords(${index})">X</button>
        </li>
    `).join('');
}

function removeFoodRecords(index) {
    foodRecords.splice(index, 1);
    renderFoodRecords();
}

function renderSavedRecipes() {
    const savedRecipeContainer = document.getElementById('saved-recipe');
    savedRecipeContainer.innerHTML = '';

    recipes.forEach((recipe, index) => {
        const recipeElement = document.createElement('div');
        recipeElement.classList.add('recipe-item');
        recipeElement.innerHTML = `
            <h3>Recipe ${index + 1}</h3>
            <p><strong>Date:</strong> ${recipe.date}</p>
            <p><strong>Recipe:</strong> ${recipe.recipe}</p>
            <p><strong>Comments:</strong> ${recipe.comments}</p>
            <p><strong>Signed:</strong> ${recipe.signed}</p>
            <button onclick="removeRecipe(${index})">Remove</button>
        `;
        savedRecipeContainer.appendChild(recipeElement);
    });
}

// Remove a recipe by index
function removeRecipe(index) {
    recipes.splice(index, 1);
    renderSavedRecipes();
}

function clearSavedRecipe() {
    todo = {};
    document.getElementById('saved-recipe').innerHTML = '';
}

function clearMarkedItems(items, form) {
    Object.keys(items).forEach(itemKey => {
        const inputElement = form.querySelector(`input[name="${itemKey}"]`);
        if (inputElement) {
            inputElement.value = '';  // Clear the input field
        }
    });
}

// ... (previous code remains the same)

function generatePDF(order) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.height;
    let yOffset = 10;

    function addLine(text, indent = 0) {
        if (yOffset > pageHeight - 10) {
            doc.addPage();
            yOffset = 10;
        }
        doc.text(text, 10 + indent, yOffset);
        yOffset += 10;
    }

    addLine(`Order Date: ${order.date}`);
    addLine(`Branch: ${order.branch}`);
    addLine(`Sign: ${order.sign}`);
    yOffset += 10;

    inventoryCategories.forEach(category => {
        const categoryItems = category.items.filter(item => {
            const itemKey = item.toLowerCase().replace(/\s+/g, '-');
            return order.items[itemKey] && order.items[itemKey] !== '0';
        });

        if (categoryItems.length > 0) {
            addLine(category.name);
            categoryItems.forEach(item => {
                const itemKey = item.toLowerCase().replace(/\s+/g, '-');
                addLine(`${item}:  x${order.items[itemKey]}`, 8);
            });
            yOffset += 10;
        }
    });

    return doc;
}


function generatePayoutsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yOffset = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(14);
    doc.text("Payouts Report", 10, 10);

    payouts.forEach((payout, index) => {
        // Check if there is enough space on the page, otherwise add a new page
        if (yOffset > pageHeight - 20) {
            doc.addPage();
            yOffset = 20; // Reset yOffset for the new page
        }

        // Add payout details to the PDF
        doc.setFontSize(12);
        doc.text(`${index + 1}. Item: ${payout.item}`, 10, yOffset);
        doc.text(`Amount: €${payout.amount}`, 10, yOffset + 10);
        doc.text(`Date: ${payout.date}`, 10, yOffset + 20);
        doc.text(`Signed: ${payout.signed}`, 10, yOffset + 30);
        
        yOffset += 40; // Adjust yOffset to make space for the next item
    });

    doc.save("payouts.pdf");
}

function generateFoodRecordsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yOffset = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(14);
    doc.text("Food Records Report", 10, 10);

    foodRecords.forEach((record, index) => {
        if (yOffset > pageHeight - 60) { // Adjust for multiple lines of content
            doc.addPage();
            yOffset = 20;
        }

        // Adding each record with spacing and page breaks if necessary
        doc.setFontSize(12);
        doc.text(`Record ${index + 1}`, 10, yOffset);
        doc.text(`Date: ${record.date}`, 10, yOffset + 10);
        doc.text(`Food Item: ${record.foodItem}`, 10, yOffset + 20);
        doc.text(`Provider: ${record.provider}`, 10, yOffset + 30);
        doc.text(`Comments: ${record.comments}`, 10, yOffset + 40);
        doc.text(`Signed: ${record.signed}`, 10, yOffset + 50);

        yOffset += 60; // Move yOffset for next item
    });

    doc.save("food_records_report.pdf");
}

function generateRecipePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yOffset = 20;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(14);
    doc.text("Coffee Recipes Report", 10, 10);

    // Iterate through all saved recipes and add them to the PDF
    recipes.forEach((recipe, index) => {
        if (yOffset > pageHeight - 60) { // Check for space, add new page if needed
            doc.addPage();
            yOffset = 20;
        }

        doc.setFontSize(12);
        doc.text(`Recipe ${index + 1}`, 10, yOffset);
        doc.text(`Date: ${recipe.date}`, 10, yOffset + 10);
        doc.text(`Recipe: ${recipe.recipe}`, 10, yOffset + 20);
        doc.text(`Comments: ${recipe.comments}`, 10, yOffset + 30);
        doc.text(`Signed: ${recipe.signed}`, 10, yOffset + 40);

        yOffset += 50; // Adjust for the next recipe
    });

    doc.save("coffee_recipes.pdf");
}

function sendEmailWithPDF(pdf) {
    // Email sending logic (needs backend integration)
    console.log("PDF generated and ready to send via email.");
    // For now, just output to console and save the PDF
    pdf.save();
}