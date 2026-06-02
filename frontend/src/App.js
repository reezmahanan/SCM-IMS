import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State variables - like memory boxes
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockOps, setShowStockOps] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Form data
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    imageUrl: ''
  });
  const [newProductImage, setNewProductImage] = useState(null);
  
  const [stockData, setStockData] = useState({
    productId: '',
    quantity: '',
    referenceDoc: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load data when page opens
  useEffect(() => {
    loadInventory();
  }, []);

  // Get all inventory from backend
  const loadInventory = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/inventory');
      setInventory(res.data);
      
      // Filter low stock items (quantity < 10)
      const lowStock = res.data.filter(item => item.quantityOnHand < item.reorderLevel);
      setLowStockItems(lowStock);
    } catch (error) {
      showMessage('Cannot connect to server! Make sure backend is running.', 'error');
    }
  };

  // Show popup message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // Add new product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.unitPrice) {
      showMessage('Please fill all fields!', 'error');
      return;
    }

    try {
      // 1. Create the product
      const res = await axios.post('http://localhost:8080/api/products', {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        unitPrice: parseFloat(newProduct.unitPrice),
        imageUrl: newProduct.imageUrl
      });
      
      const createdProduct = res.data;

      // 2. Upload image file if selected
      if (newProductImage) {
        const formData = new FormData();
        formData.append('image', newProductImage);
        try {
          await axios.post(`http://localhost:8080/api/products/${createdProduct.productId}/image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showMessage('Product added, but image upload failed!', 'warning');
        }
      }
      
      showMessage('Product added successfully!', 'success');
      setNewProduct({ name: '', sku: '', category: '', unitPrice: '', imageUrl: '' });
      setNewProductImage(null);
      setShowAddProduct(false);
      loadInventory();
    } catch (error) {
      const text = error?.response?.data?.message || error.message || 'Error adding product';
      showMessage(text, 'error');
      console.error('addProduct error:', error);
    }
  };

  // Add stock
  const addStock = async () => {
    if (!stockData.productId || !stockData.quantity) {
      showMessage('Please select product and enter quantity!', 'error');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/inventory/add', {
        productId: parseInt(stockData.productId),
        quantity: parseInt(stockData.quantity),
        referenceDoc: stockData.referenceDoc || 'MANUAL-001'
      });
      
      showMessage(`Added ${stockData.quantity} units! (${res.data.previousQuantity} → ${res.data.newQuantity})`, 'success');
      setStockData({ productId: '', quantity: '', referenceDoc: '' });
      setShowStockOps(false);
      loadInventory();
    } catch (error) {
      showMessage('Error adding stock', 'error');
    }
  };

  // Reduce stock
  const reduceStock = async () => {
    if (!stockData.productId || !stockData.quantity) {
      showMessage('Please select product and enter quantity!', 'error');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/inventory/reduce', {
        productId: parseInt(stockData.productId),
        quantity: parseInt(stockData.quantity),
        referenceDoc: stockData.referenceDoc || 'SALE-001'
      });
      
      if (res.data.success) {
        showMessage(`Sold ${stockData.quantity} units! (${res.data.previousQuantity} → ${res.data.newQuantity})`, 'success');
      } else {
        showMessage(`${res.data.error}`, 'error');
      }
      
      setStockData({ productId: '', quantity: '', referenceDoc: '' });
      setShowStockOps(false);
      loadInventory();
    } catch (error) {
      showMessage('Error reducing stock', 'error');
    }
  };

  // Dynamic categories compiled from inventory list
  const categories = [...new Set(inventory.map(item => item.product?.category).filter(Boolean))];

  // Client-side search, filter and sort implementation
  const filteredInventory = inventory.filter(item => {
    const product = item.product || {};
    const name = (product.name || '').toLowerCase();
    const sku = (product.sku || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const search = searchQuery.toLowerCase();

    // 1. Search Query filter (matches name, SKU, or category)
    const matchesSearch = name.includes(search) || sku.includes(search) || category.includes(search) || item.productId.toString().includes(search);

    // 2. Category filter
    const matchesCategory = !selectedCategory || product.category === selectedCategory;

    // 3. Stock Status filter
    const isLowStock = item.quantityOnHand < item.reorderLevel;
    const isOutOfStock = item.quantityOnHand === 0;
    
    let matchesStatus = true;
    if (selectedStatus === 'low') {
      matchesStatus = isLowStock;
    } else if (selectedStatus === 'out') {
      matchesStatus = isOutOfStock;
    } else if (selectedStatus === 'in') {
      matchesStatus = !isLowStock && item.quantityOnHand > 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (!sortBy) return 0;
    
    const prodA = a.product || {};
    const prodB = b.product || {};

    if (sortBy === 'name-asc') {
      return (prodA.name || '').localeCompare(prodB.name || '');
    } else if (sortBy === 'name-desc') {
      return (prodB.name || '').localeCompare(prodA.name || '');
    } else if (sortBy === 'price-asc') {
      return (prodA.unitPrice || 0) - (prodB.unitPrice || 0);
    } else if (sortBy === 'price-desc') {
      return (prodB.unitPrice || 0) - (prodA.unitPrice || 0);
    } else if (sortBy === 'qty-asc') {
      return a.quantityOnHand - b.quantityOnHand;
    } else if (sortBy === 'qty-desc') {
      return b.quantityOnHand - a.quantityOnHand;
    }
    return 0;
  });

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Inventory Management System</h1>
        <p>Track your products and stock levels easily</p>
      </header>

      {/* Popup Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{inventory.length}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {inventory.reduce((sum, item) => sum + item.quantityOnHand, 0)}
          </div>
          <div className="stat-label">Total Stock Units</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{lowStockItems.length}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>
           Add New Product
        </button>
        <button className="btn btn-success" onClick={() => setShowStockOps(true)}>
           Stock Operations
        </button>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <input
              type="text"
              placeholder="Product Name *"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="SKU (Unique Code) *"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            />
            <input
              type="number"
              placeholder="Price *"
              value={newProduct.unitPrice}
              onChange={(e) => setNewProduct({...newProduct, unitPrice: e.target.value})}
            />
            <input
              type="text"
              placeholder="Image URL (Optional)"
              value={newProduct.imageUrl || ''}
              onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
            />
            <div className="image-upload-wrapper">
              <label className="file-upload-label">
                <span>Upload Image File (Optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewProductImage(e.target.files[0])}
                />
              </label>
              {newProductImage && <span className="file-name">{newProductImage.name}</span>}
            </div>
            <div className="modal-buttons" style={{ marginTop: '15px' }}>
              <button className="btn btn-success" onClick={addProduct}>Save Product</button>
              <button className="btn btn-danger" onClick={() => {
                setShowAddProduct(false);
                setNewProductImage(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Operations Modal */}
      {showStockOps && (
        <div className="modal">
          <div className="modal-content">
            <h2>Stock Operations</h2>
            <select
              value={stockData.productId}
              onChange={(e) => setStockData({...stockData, productId: e.target.value})}
            >
              <option value="">Select Product</option>
              {inventory.map(item => (
                <option key={item.productId} value={item.productId}>
                  {item.product?.name || `Product ${item.productId}`} - Stock: {item.quantityOnHand}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={stockData.quantity}
              onChange={(e) => setStockData({...stockData, quantity: e.target.value})}
            />
            <input
              type="text"
              placeholder="Reference (PO/SO Number)"
              value={stockData.referenceDoc}
              onChange={(e) => setStockData({...stockData, referenceDoc: e.target.value})}
            />
            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={addStock}>  Add Stock (IN)</button>
              <button className="btn btn-warning" onClick={reduceStock}> Reduce Stock (OUT)</button>
              <button className="btn btn-danger" onClick={() => setShowStockOps(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="inventory-table">
        <div className="table-header-row">
          <h2>Current Inventory</h2>
          
          {/* Search & Filter Controls */}
          <div className="filters-bar">
            <div className="search-box">
              <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-btn" onClick={() => setSearchQuery('')}>&times;</button>
              )}
            </div>

            <div className="filter-group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low → High)</option>
                <option value="price-desc">Price (High → Low)</option>
                <option value="qty-asc">Quantity (Low → High)</option>
                <option value="qty-desc">Quantity (High → Low)</option>
              </select>
            </div>
          </div>
        </div>

        {filteredInventory.length === 0 ? (
          <div className="empty-state">
            <p>No products match your search/filters.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const product = item.product || {};
                const isLowStock = item.quantityOnHand < item.reorderLevel;
                const isOutOfStock = item.quantityOnHand === 0;

                // Function to get initials for placeholder
                const getInitials = (name) => {
                  if (!name) return 'P';
                  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                };

                return (
                  <tr key={item.inventoryId} className={isOutOfStock ? 'out-of-stock-row' : isLowStock ? 'low-stock-row' : ''}>
                    <td>
                      <div className="product-cell">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name || 'Product'}
                            className="product-thumbnail"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {(!product.imageUrl || product.imageUrl === '') ? (
                          <div className="product-placeholder">
                            {getInitials(product.name)}
                          </div>
                        ) : (
                          <div className="product-placeholder" style={{ display: 'none' }}>
                            {getInitials(product.name)}
                          </div>
                        )}
                        <div className="product-details">
                          <span className="product-name">{product.name || 'Unnamed Product'}</span>
                          <span className="product-sku">{product.sku || 'No SKU'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{product.category || 'General'}</span>
                    </td>
                    <td>
                      <span className="price-tag">${(product.unitPrice || 0).toFixed(2)}</span>
                    </td>
                    <td className={isOutOfStock ? 'out-of-stock-text' : isLowStock ? 'low-stock-text' : ''}>
                      <div className="stock-level-cell">
                        <strong>{item.quantityOnHand}</strong>
                        <div className="stock-bar-bg">
                          <div 
                            className={`stock-bar-fill ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'ok'}`} 
                            style={{ width: `${Math.min((item.quantityOnHand / (item.reorderLevel * 2)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>
                      {isOutOfStock ? (
                        <span className="badge badge-out">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="badge badge-danger">Low Stock!</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>Inventory Management System </p>
      </footer>
    </div>
  );
}

export default App;