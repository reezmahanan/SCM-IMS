import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  // Application Data State
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  
  // Modals Visibility
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockOps, setShowStockOps] = useState(false);
  
  // Form Data
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    image: null
  });
  
  const [stockData, setStockData] = useState({
    productId: '',
    quantity: '',
    referenceDoc: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [uploading, setUploading] = useState(false);

  // Setup Axios Interceptors for JWT authorization header
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 403 / 401 (unauthorized) and log out
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          handleLogout();
          showMessage('Session expired. Please log in again.', 'error');
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Load data when page opens or token changes
  useEffect(() => {
    if (token) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load both inventory and product details from backend
  const loadData = async () => {
    try {
      // Fetch both endpoints concurrently
      const [invRes, prodRes] = await Promise.all([
        axios.get('http://localhost:8080/api/inventory'),
        axios.get('http://localhost:8080/api/products')
      ]);
      
      setInventory(invRes.data);
      setProducts(prodRes.data);
      
      // Filter low stock items (quantity < 10)
      const lowStock = invRes.data.filter(item => item.quantityOnHand < item.reorderLevel);
      setLowStockItems(lowStock);
    } catch (error) {
      console.error("loadData error:", error);
      showMessage('Cannot fetch data! Make sure backend is running.', 'error');
    }
  };

  // Login handlers
  const handleLoginSuccess = (userToken, userNm, userRole) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('username', userNm);
    localStorage.setItem('role', userRole);
    setToken(userToken);
    setUsername(userNm);
    setRole(userRole);
    showMessage(`Welcome back, ${userNm}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setToken('');
    setUsername('');
    setRole('');
    setInventory([]);
    setProducts([]);
    setLowStockItems([]);
  };

  // Show popup message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewProduct({ ...newProduct, image: e.target.files[0] });
    }
  };

  // Add new product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.unitPrice) {
      showMessage('Please fill all required fields!', 'error');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Create product
      const res = await axios.post('http://localhost:8080/api/products', {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        unitPrice: parseFloat(newProduct.unitPrice)
      });
      
      const createdProduct = res.data;

      // Step 2: Upload image if selected
      if (newProduct.image && createdProduct.productId) {
        const formData = new FormData();
        formData.append('image', newProduct.image);
        
        await axios.post(
          `http://localhost:8080/api/products/${createdProduct.productId}/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      showMessage('Product added successfully!', 'success');
      setNewProduct({ name: '', sku: '', category: '', unitPrice: '', image: null });
      setShowAddProduct(false);
      loadData();
    } catch (error) {
      const text = error?.response?.data?.message || error.message || 'Error adding product';
      showMessage(text, 'error');
      console.error('addProduct error:', error);
    } finally {
      setUploading(false);
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
      loadData();
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
      loadData();
    } catch (error) {
      showMessage('Error reducing stock', 'error');
    }
  };

  // Helper: Find product details by productId
  const getProductDetails = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product || { name: `Product ${productId}`, sku: 'N/A', category: 'N/A', unitPrice: 0.0, imageUrl: '' };
  };

  // If token is missing, display authentication interface
  if (!token) {
    return (
      <div className="auth-container">
        <header className="auth-brand-header">
          <h1>SCM-IMS Portal</h1>
          <p>Supply Chain & Inventory Management System</p>
        </header>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="auth-wrapper">
          {authView === 'login' ? (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onToggleRegister={() => setAuthView('register')} 
            />
          ) : (
            <Register 
              onRegisterSuccess={() => setAuthView('login')} 
              onToggleLogin={() => setAuthView('login')} 
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <h1>SCM Inventory Management</h1>
          <p>Logged in as: <strong>{username}</strong> ({role})</p>
        </div>
        <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
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
            <div className="modal-form-group">
              <label>Product Name *</label>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            
            <div className="modal-form-group">
              <label>SKU (Unique Code) *</label>
              <input
                type="text"
                placeholder="SKU"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
              />
            </div>

            <div className="modal-form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              />
            </div>

            <div className="modal-form-group">
              <label>Unit Price ($) *</label>
              <input
                type="number"
                placeholder="Price"
                value={newProduct.unitPrice}
                onChange={(e) => setNewProduct({...newProduct, unitPrice: e.target.value})}
              />
            </div>

            <div className="modal-form-group">
              <label>Product Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {newProduct.image && (
                <p className="file-name-preview">Selected: {newProduct.image.name}</p>
              )}
            </div>

            <div className="modal-buttons">
              <button className="btn btn-success" onClick={addProduct} disabled={uploading}>
                {uploading ? 'Saving...' : 'Save Product'}
              </button>
              <button className="btn btn-danger" onClick={() => setShowAddProduct(false)} disabled={uploading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Operations Modal */}
      {showStockOps && (
        <div className="modal">
          <div className="modal-content">
            <h2>Stock Operations</h2>
            <div className="modal-form-group">
              <label>Select Product *</label>
              <select
                value={stockData.productId}
                onChange={(e) => setStockData({...stockData, productId: e.target.value})}
              >
                <option value="">Select Product</option>
                {inventory.map(item => {
                  const details = getProductDetails(item.productId);
                  return (
                    <option key={item.productId} value={item.productId}>
                      {details.name} (SKU: {details.sku}) - Stock: {item.quantityOnHand}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="modal-form-group">
              <label>Quantity *</label>
              <input
                type="number"
                placeholder="Quantity"
                value={stockData.quantity}
                onChange={(e) => setStockData({...stockData, quantity: e.target.value})}
              />
            </div>

            <div className="modal-form-group">
              <label>Reference (PO/SO Number)</label>
              <input
                type="text"
                placeholder="Reference"
                value={stockData.referenceDoc}
                onChange={(e) => setStockData({...stockData, referenceDoc: e.target.value})}
              />
            </div>

            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={addStock}>Add Stock (IN)</button>
              <button className="btn btn-warning" onClick={reduceStock}>Reduce Stock (OUT)</button>
              <button className="btn btn-danger" onClick={() => setShowStockOps(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="inventory-table">
        <h2>Current Inventory</h2>
        {inventory.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Click "Add New Product" to get started!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const details = getProductDetails(item.productId);
                const isLowStock = item.quantityOnHand < item.reorderLevel;
                return (
                  <tr key={item.inventoryId} className={isLowStock ? 'low-stock-row' : ''}>
                    <td>
                      {details.imageUrl ? (
                        <div className="product-image-container">
                          <img 
                            src={`http://localhost:8080${details.imageUrl}`} 
                            alt={details.name} 
                            className="product-thumbnail" 
                          />
                        </div>
                      ) : (
                        <div className="product-image-placeholder">
                          {details.name ? details.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </td>
                    <td className="sku-cell">{details.sku}</td>
                    <td className="product-name-cell">{details.name}</td>
                    <td><span className="category-tag">{details.category || 'General'}</span></td>
                    <td className="price-cell">${details.unitPrice ? details.unitPrice.toFixed(2) : '0.00'}</td>
                    <td className={isLowStock ? 'low-stock' : ''}>
                      <strong>{item.quantityOnHand}</strong>
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>
                      {isLowStock ? (
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
        <p>SCM Inventory Management System &copy; 2026. Security powered by JWT.</p>
      </footer>
    </div>
  );
}

export default App;