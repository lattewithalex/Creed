const { jsPDF } = window.jspdf;

const inventoryCategories = [
  {
    name: "Coffee",
    items: [
      "Coffee 1kg",
      "Decaf 1kg",
      "Decaf 250g",
      "Brazil",
      "Skipper",
      "Colombia El Messon",
      "Colombia piendamo",
      "Guatemala",
      "Peru",
      "Ethiopia",
      "Tanzania",
      "Congo",
      "Costa R",
      "Kenya",
      "Rwanda",
      "Nicaragua"
    ]
  },
  {
    name: "Cups and Lids",
    items: [
      "12oz Cups",
      "12oz lids",
      "8oz Cups",
      "8oz lids",
      "Ice Cup",
      "Ice lids",
    ]
  },
  {
    name: "Holders",
    items: ["Holder 2Cups", "Holder 4Cups"]
  },
  {
    name: "Bags",
    items: ["Small Handle bag", "Large Handle bag", "Pastries Bag"]
  },
  {
    name: "Napkins and Rolls",
    items: ["Blue Roll", "Napkins", "CC Roll", "Till Roll"]
  },
  {
    name: "Syrups",
    items: ["Caramel S.", "Vanilla S.", "Hazelnut S."]
  },
  {
    name: "Milk",
    items: [
      "Coconut Milk",
      "Oat Milk",
      "Almond Milk",
    ]
  },
  {
    name: "Tea",
    items: [
      "Black Tea",
      "Earl Grey",
      "Pepper Mint",
      "Berry",
      "Lemon Ginger",
      "Chamolle",
      "Sencha Green"
    ]
  },
  {
    name: "Other Products",
    items: ["Chai", "Hot Choc", "Marshmellows", "Matcha"]
  },
  {
    name: "Cleaning Products",
    items: ["SW Cleaner", "Profiler C.", "Puly Cleaner"]
  },
  {
    name: "Soft Drinks",
    items: [
      "Coke Origina",
      "Coke Zero",
      "Still Water",
      "Sparkling Water",
      "Vit-Hit",
      "Capri-Sun",
      "SanPellegrino Orange",
      "SanPellegrino Blood orange",
      "Sanpellegrino Lemon"
    ]
  },
  {
    name: "Filters and Equipment",
    items: [
      "Filtropa Filter",
      "V60 Filter 1",
      "V60 Filter 2",
      "V60 Dripper 1",
      "V60 Dripper 2",
      "Aeropress",
      "Aeropress Filter",
      "Chemex Filter",
      "Bialetti Mocha"
    ]
  },
  {
    name: "Miscellaneous",
    items: [
      "Fulfil CP&C",
      "Fulfill Choc&H",
      "Fulfill CB",
      "Brown Sugar",
      "Sweetner"
    ]
  }
];

function createInventoryTables() {
  const inventoryList = document.getElementById("inventory-list");
  inventoryCategories.forEach((category) => {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "inventory-category";

    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = category.name;
    header.onclick = () => {
      const content = categoryDiv.querySelector(".category-content");
      content.style.display =
        content.style.display === "none" ? "block" : "none";
    };

    const contentDiv = document.createElement("div");
    contentDiv.className = "category-content";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    const headerRow = thead.insertRow();
    const headerCell1 = headerRow.insertCell(0);
    const headerCell2 = headerRow.insertCell(1);
    headerCell1.textContent = category.name;
    headerCell2.textContent = "Qty";

    category.items.forEach((item) => {
      const row = tbody.insertRow();
      const cell1 = row.insertCell(0);
      const cell2 = row.insertCell(1);
      cell1.textContent = item;
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.name = item.toLowerCase().replace(/\s+/g, "-");
      cell2.appendChild(input);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    contentDiv.appendChild(table);
    categoryDiv.appendChild(header);
    categoryDiv.appendChild(contentDiv);
    inventoryList.appendChild(categoryDiv);
  });
}

function generatePDF(order) {
  const doc = new jsPDF();
  doc.text(`Order Date: ${order.date}`, 10, 10);
  doc.text(`Sign: ${order.sign}`, 10, 20);
  doc.text(`Branch: ${order.branch}`, 10, 30);
  let yOffset = 40;
  Object.keys(order.items).forEach((item, index) => {
    doc.text(`${item}: ${order.items[item]}`, 10, yOffset + index * 10);
  });
  return doc;
}

function sendEmailWithPDF(pdf) {
  // Email sending logic (needs backend integration)
  console.log("PDF generated and ready to send via email.");
  // For now, just output to console
  pdf.save("order.pdf");
}

document
  .getElementById("orderForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const order = {
      date: document.getElementById("orderDate").value,
      sign: document.getElementById("sign").value,
      branch: document.getElementById("branch").value,
      items: {}
    };
    if (!order.date || !order.sign || !order.branch) {
      alert("Please fill in all required fields.");
      return;
    }
    const inputs = document.querySelectorAll(
      "#inventory-list input[type='number']"
    );
    inputs.forEach((input) => {
      if (input.value) {
        order.items[input.name] = input.value;
      }
    });
    const pdf = generatePDF(order);
    sendEmailWithPDF(pdf);
  });

createInventoryTables();
