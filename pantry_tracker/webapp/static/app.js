// Remove baseUrl and use relative URLs in fetch calls

let categories = []; // Global categories array
let existingCategories = []; // Categories fetched from backend
let existingProducts = []; // Products fetched from backend

// Show the selected tab
function showTab(tab) {
    // Debugging statements
    console.log('home-container element:', document.getElementById('home-container'));
    console.log('generate-container element:', document.getElementById('generate-container'));

    // Hide all tabs
    document.getElementById('home-container').style.display = 'none';
    document.getElementById('generate-container').style.display = 'none';

    // Show the selected tab
    document.getElementById(`${tab}-container`).style.display = 'block';

    if (tab === 'home') {
        fetchProducts();
    } else if (tab === 'generate') {
        loadExistingEntities();
    }
}

// Fetch products from the backend
const fetchProducts = async () => {
    try {
        const response = await fetch('api/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const products = await response.json();
        if (products.length > 0) {
            displayProducts(products);
        } else {
            displayNoDataMessage();
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};

// Updated displayProducts function
const displayProducts = (products) => {
    const categoriesContainer = document.getElementById('categories-container');
    categoriesContainer.innerHTML = ''; // Clear existing content

    const categoriesData = {};
    let uncategorized = [];

    products.forEach(product => {
        // Skip entities with state -10 (categories)
        if (parseInt(product.state) === -10) {
            return; // Skip this entity
        }

        const entityId = product.entity_id;
        const productName = product.attributes.friendly_name || formatProductName(entityId);
        const productImage = product.attributes.product_image || '';
        const productCategory = product.attributes.assoc_cat || null;
        const quantity = parseInt(product.state);

        if (productCategory) {
            if (!categoriesData[productCategory]) {
                categoriesData[productCategory] = [];
            }
            categoriesData[productCategory].push({
                productName,
                productImage,
                entityId,
                quantity
            });
        } else {
            uncategorized.push({
                productName,
                productImage,
                entityId,
                quantity
            });
        }
    });

    // Display categories
    Object.keys(categoriesData).forEach(category => {
        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');
        categoryHeader.innerHTML = `<i class="mdi mdi-alpha-c-box-outline"></i> ${capitalizeFirstLetter(category)}`;
        categoryHeader.onclick = () => toggleCategory(category);

        const categoryContent = document.createElement('div');
        categoryContent.classList.add('category-content');
        categoryContent.id = `category-${category}`;

        const table = createProductTable(categoriesData[category]);
        categoryContent.appendChild(table);

        categoriesContainer.appendChild(categoryHeader);
        categoriesContainer.appendChild(categoryContent);
    });

    // Display uncategorized products
    if (uncategorized.length > 0) {
        const uncategorizedHeader = document.createElement('div');
        uncategorizedHeader.classList.add('category-header');
        uncategorizedHeader.innerHTML = `<i class="mdi mdi-help-box"></i> Uncategorized`;
        uncategorizedHeader.onclick = () => toggleCategory('uncategorized');

        const uncategorizedContent = document.createElement('div');
        uncategorizedContent.classList.add('category-content');
        uncategorizedContent.id = 'category-uncategorized';

        const table = createProductTable(uncategorized);
        uncategorizedContent.appendChild(table);

        categoriesContainer.appendChild(uncategorizedHeader);
        categoriesContainer.appendChild(uncategorizedContent);
    }
};

// Display "No data" message with options to add first product or category
const displayNoDataMessage = () => {
    const categoriesContainer = document.getElementById('categories-container');
    categoriesContainer.innerHTML = `
        <div class="no-data-message">
            <p>No data available.</p>
            <button onclick="showTab('generate')">Add First Product</button>
            <button onclick="showTab('generate')">Add First Category</button>
        </div>
    `;
};

// Create product table
const createProductTable = (products) => {
    const table = document.createElement('table');
    const tableHead = `
        <thead>
            <tr>
                <th>Product Name</th>
                <th>Product Image</th>
                <th>Quantity Remaining</th>
                <th>Add/Remove</th>
            </tr>
        </thead>
    `;
    const tableBody = document.createElement('tbody');
    products.forEach(product => {
        const row = document.createElement('tr');
        const productImage = product.productImage ? `<img src="${product.productImage}" alt="${product.productName}" class="product-image" />` : `<i class="mdi mdi-store"></i>`;
        row.innerHTML = `
            <td>${product.productName}</td>
            <td>${productImage}</td>
            <td id="quantity-${product.entityId}">${product.quantity}</td>
            <td class="add-remove-buttons">
                <button class="remove-btn" onclick="adjustQuantity('${product.entityId}', -1)">-</button>
                <button class="add-btn" onclick="adjustQuantity('${product.entityId}', 1)">+</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    table.innerHTML = tableHead;
    table.appendChild(tableBody);
    return table;
};

// Adjust product quantity
const adjustQuantity = async (entityId, adjustment) => {
    try {
        const response = await fetch(`api/products/${encodeURIComponent(entityId)}/adjust`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adjustment: adjustment })
        });
        if (!response.ok) {
            throw new Error('Failed to adjust quantity');
        }
        const data = await response.json();
        document.getElementById(`quantity-${entityId}`).textContent = data.new_value;
    } catch (error) {
        console.error('Error adjusting quantity:', error);
    }
};

// Load existing categories and products into the Generate page
const loadExistingEntities = async () => {
    try {
        const response = await fetch(`api/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch entities: ${response.statusText}`);
        }

        const entities = await response.json();
        existingCategories = [];
        existingProducts = [];

        entities.forEach(entity => {
            const entityId = entity.entity_id;
            const friendlyName = entity.attributes.friendly_name || formatProductName(entityId);
            const isCategory = entity.attributes.is_category ? true : false;
            const imageUrl = entity.attributes.product_image || '';
            const assocCat = entity.attributes.assoc_cat || '';

            if (isCategory) {
                existingCategories.push({
                    name: friendlyName,
                    entityId: entityId
                });
            } else {
                existingProducts.push({
                    name: friendlyName,
                    imageUrl: imageUrl,
                    category: assocCat,
                    entityId: entityId
                });
            }
        });

        populateGenerateForm();
    } catch (error) {
        console.error('Error loading entities:', error);
    }
};

// Populate the Generate form with existing entities
const populateGenerateForm = () => {
    // Clear existing rows
    document.getElementById('category-rows').innerHTML = '';
    document.getElementById('product-rows').innerHTML = '';

    // Populate categories
    existingCategories.forEach(category => {
        addCategoryRow(category.name, category.entityId);
    });

    // Populate products
    existingProducts.forEach(product => {
        addProductRow(product.name, product.imageUrl, product.category, product.entityId);
    });
};

// Add a category row
const addCategoryRow = (name = '', entityId = '') => {
    const categoryRows = document.getElementById('category-rows');
    const newRow = document.createElement('div');
    newRow.classList.add('config-row');
    newRow.setAttribute('data-entity-id', entityId);
    newRow.innerHTML = `
        <i class="mdi mdi-alpha-c-box-outline"></i>
        <input type="text" placeholder="Category Name" class="category-name input-field" value="${name}" />
        <button onclick="removeRow(this, 'category')" class="remove-btn">-</button>
    `;
    categoryRows.appendChild(newRow);
    updateCategories();
};

// Add a product row
const addProductRow = (name = '', imageUrl = '', category = '', entityId = '') => {
    const productRows = document.getElementById('product-rows');
    const newRow = document.createElement('div');
    newRow.classList.add('config-row');
    newRow.setAttribute('data-entity-id', entityId);
    newRow.innerHTML = `
        <i class="mdi mdi-store"></i>
        <input type="text" placeholder="Product Name" class="product-name input-field" value="${name}" />
        <input type="text" placeholder="Image URL" class="input-field" value="${imageUrl}" />
        <select class="category-select input-field">
            <option value="">Select Category</option>
        </select>
        <button onclick="removeRow(this, 'product')" class="remove-btn">-</button>
    `;
    productRows.appendChild(newRow);
    updateCategories();
    if (category) {
        newRow.querySelector('.category-select').value = category;
    }
};

// Remove a row and delete the entity from Home Assistant
const removeRow = (button, type) => {
    const row = button.parentElement;
    const entityId = row.getAttribute('data-entity-id');

    if (entityId) {
        // Send a DELETE request to remove the entity from Home Assistant
        deleteEntity(entityId);
    }

    row.parentElement.removeChild(row);
    updateCategories();
};

// Delete an entity via backend
const deleteEntity = async (entityId) => {
    try {
        const response = await fetch(`api/entities/${encodeURIComponent(entityId)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete entity');
        }
        console.log(`Entity ${entityId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting entity:', error);
    }
};

// Update categories in dropdowns
function updateCategories() {
    const categoryNames = Array.from(document.querySelectorAll('.category-name'))
        .map(input => input.value.trim());

    categories = categoryNames;

    const dropdowns = document.querySelectorAll('.category-select');
    dropdowns.forEach(dropdown => {
        const selectedValue = dropdown.value;
        dropdown.innerHTML = `<option value="">Select Category</option>`; // Reset dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = capitalizeFirstLetter(category);
            dropdown.appendChild(option);
        });
        if (categories.includes(selectedValue)) {
            dropdown.value = selectedValue;
        }
    });
}

// Save entities (categories and products)
const saveEntities = async () => {
    // Collect categories
    const categoryRows = document.querySelectorAll('#category-rows .config-row');
    const categoryData = [];
    categoryRows.forEach(row => {
        const name = row.querySelector('.category-name').value.trim();
        const entityId = row.getAttribute('data-entity-id');
        if (name) {
            categoryData.push({ name, entityId });
        }
    });

    // Collect products
    const productRows = document.querySelectorAll('#product-rows .config-row');
    const productData = [];
    productRows.forEach(row => {
        const name = row.querySelector('.product-name').value.trim();
        const imageUrl = row.querySelector('input[placeholder="Image URL"]').value.trim();
        const category = row.querySelector('.category-select').value;
        const entityId = row.getAttribute('data-entity-id');
        if (name) {
            productData.push({ name, image_url: imageUrl, category, entityId });
        }
    });

    // Send categories to backend
    for (const category of categoryData) {
        const entityData = {
            name: category.name,
            type: 'category',
            entity_id: category.entityId
        };
        await createEntity(entityData);
    }

    // Send products to backend
    for (const product of productData) {
        const entityData = {
            name: product.name,
            image_url: product.image_url,
            type: 'product',
            category: product.category,
            entity_id: product.entityId
        };
        await createEntity(entityData);
    }

    // Refresh the product list
    fetchProducts();

    // Show the Home tab
    showTab('home');
};

// Create or update an entity via backend
const createEntity = async (entityData) => {
    try {
        const response = await fetch(`api/entities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entityData)
        });
        if (!response.ok) {
            throw new Error('Failed to create entity');
        }
        console.log(`Entity ${entityData.name} created or updated successfully`);
    } catch (error) {
        console.error('Error creating entity:', error);
    }
};

// Helper functions
const formatProductName = (entityId) => {
    const namePart = entityId.replace('pantry_tracker.', '');
    const nameComponents = namePart.split('_');
    const productName = nameComponents.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return productName;
};

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const toggleCategory = (category) => {
    const categoryContent = document.getElementById(`category-${category}`);
    categoryContent.style.display = categoryContent.style.display === 'none' ? 'block' : 'none';
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    showTab('home');
});
