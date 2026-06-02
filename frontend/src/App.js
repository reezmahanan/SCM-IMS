import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './Dashboard';
import Login from './Login';
import Register from './Register';
import './App.css';

function App() {

  // Inventory and Products states
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockOps, setShowStockOps] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  
  // Image Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  // Search, Filter, and Sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    image: ''
  });
  
  const [stockData, setStockData] = useState({
    productId: '',
    quantity: '',
    referenceDoc: ''
  });

  const [editingProduct, setEditingProduct] = useState({
    productId: '',
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    reorderLevel: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load data when page opens
  useEffect(() => {
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch both products and inventory
  const loadData = async () => {
    try {
      // Load products first
      const productsRes = await axios.get('http://localhost:8080/api/products');
      setProducts(productsRes.data);

      // Load inventory
      const inventoryRes = await axios.get('http://localhost:8080/api/inventory');
      setInventory(inventoryRes.data);
      
      // Filter low stock items (quantity < reorderLevel)
      const lowStock = inventoryRes.data.filter(item => item.quantityOnHand < item.reorderLevel);

  }, []);

  // Load products and inventory from backend
  const loadData = async () => {
    try {
      // 1. Fetch products to resolve names and images
      const prodRes = await axios.get('http://localhost:8080/api/products');
      setProducts(prodRes.data);

      // 2. Fetch inventory
      const invRes = await axios.get('http://localhost:8080/api/inventory');
      setInventory(invRes.data);
      
      // Filter low stock items (quantity < 10)
      const lowStock = invRes.data.filter(item => item.quantityOnHand < item.reorderLevel);

      setLowStockItems(lowStock);
    } catch (error) {
      showMessage('Cannot connect to server! Make sure backend is running.', 'error');
    }
  };

  // Show status popup message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Image Upload handler (converts selected file to Base64)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 2MB size limit to prevent storing excessively large base64 records
      if (file.size > 2 * 1024 * 1024) {
        showMessage('Image file is too large! Please choose a file under 2MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.unitPrice) {
      showMessage('Please fill all required fields!', 'error');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/products', {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        unitPrice: parseFloat(newProduct.unitPrice),
        image: newProduct.image
      });
      
      showMessage('Product added successfully!', 'success');
      setNewProduct({ name: '', sku: '', category: '', unitPrice: '' });

      setNewProduct({ name: '', sku: '', category: '', unitPrice: '', image: '' });

      setShowAddProduct(false);
      loadData();
    } catch (error) {
      const text = error?.response?.data?.message || error.message || 'Error adding product';
      showMessage(text, 'error');
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

  useEffect(() => {
    // Add a request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );


    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);


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


  // Helper functions for matching product details in inventory list
  const getProductName = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.name : `Product ${productId}`;
  };

  const getProductSku = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.sku : '-';
  };

  const getProductCategory = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.category || 'General' : '-';
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? `$${product.unitPrice.toFixed(2)}` : '-';
  };

  // Handle Edit Button Click
  const handleEditClick = (item) => {
    const product = products.find(p => p.productId === item.productId);
    if (product) {
      setEditingProduct({
        productId: product.productId,
        name: product.name,
        sku: product.sku,
        category: product.category || '',
        unitPrice: product.unitPrice,
        reorderLevel: item.reorderLevel
      });
      setShowEditProduct(true);
    }
  };

  // Save product changes
  const saveProductEdit = async () => {
    if (!editingProduct.name || !editingProduct.sku || !editingProduct.unitPrice) {
      showMessage('Please fill all required fields!', 'error');
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/products/${editingProduct.productId}`, {
        name: editingProduct.name,
        sku: editingProduct.sku,
        category: editingProduct.category,
        unitPrice: parseFloat(editingProduct.unitPrice),
        reorderLevel: parseInt(editingProduct.reorderLevel)
      });

      showMessage('Product updated successfully!', 'success');
      setShowEditProduct(false);
      loadData();
    } catch (error) {
      const text = error?.response?.data?.message || error.message || 'Error updating product';
      showMessage(text, 'error');
    }
  };

  // Delete product action
  const handleDeleteClick = async (productId) => {
    const name = getProductName(productId);
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${name}"?\nThis will permanently delete the product, its stock levels, and transaction history!`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/products/${productId}`);
      showMessage('Product deleted successfully!', 'success');
      loadData();
    } catch (error) {
      showMessage('Error deleting product', 'error');
    }

  // Helper resolvers
  const getProduct = (productId) => {
    return products.find(p => p.productId === productId) || null;
  };

  const getProductName = (productId) => {
    const prod = getProduct(productId);
    return prod ? prod.name : `Product ${productId}`;

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;


  };

  // Extract unique categories dynamically from products
  const categories = Array.from(
    new Set(
      products
        .map(p => p.category)
        .filter(c => c && c.trim() !== '')
    )
  );

  // Filter and sort inventory client-side
  const filteredInventory = inventory
    .filter(item => {
      const prod = getProduct(item.productId);
      const prodName = prod ? prod.name : `Product ${item.productId}`;
      const prodSku = prod ? prod.sku : '';
      const prodCategory = prod ? prod.category : '';
      const isLowStock = item.quantityOnHand < item.reorderLevel;

      // 1. Search term match (Name or SKU)
      const matchesSearch = searchTerm.trim() === '' ||
        prodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prodSku.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Category match
      const matchesCategory = selectedCategory === '' ||
        (prodCategory && prodCategory.toLowerCase() === selectedCategory.toLowerCase());

      // 3. Stock status match
      const matchesStatus = stockStatusFilter === 'all' ||
        (stockStatusFilter === 'lowStock' && isLowStock) ||
        (stockStatusFilter === 'inStock' && !isLowStock);

      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const prodA = getProduct(a.productId);
      const prodB = getProduct(b.productId);

      if (sortBy === 'name') {
        const nameA = prodA ? prodA.name.toLowerCase() : '';
        const nameB = prodB ? prodB.name.toLowerCase() : '';
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'quantity') {
        return a.quantityOnHand - b.quantityOnHand;
      } else if (sortBy === 'price') {
        const priceA = prodA ? prodA.unitPrice : 0;
        const priceB = prodB ? prodB.unitPrice : 0;
        return priceA - priceB;
      } else {
        return a.productId - b.productId; // Default: Sort by Product ID
      }
    });

  return (

    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Inventory Management System</h1>
        <p>Track your products and stock levels easily</p>
      </header>

      {/* Status Messages */}
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
            
            {/* Product Image Uploader */}
            <div className="image-upload-container">
              <label>Product Image</label>
              <div className="image-input-wrapper">
                <label htmlFor="product-image-file" className="file-input-btn">
                  Choose Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                  id="product-image-file"
                />
                {newProduct.image && (
                  <img src={newProduct.image} alt="Preview" className="upload-preview" />
                )}
              </div>
            </div>

            <div className="modal-buttons">
              <button className="btn btn-success" onClick={addProduct}>Save Product</button>
              <button className="btn btn-danger" onClick={() => {
                setNewProduct({ name: '', sku: '', category: '', unitPrice: '', image: '' });
                setShowAddProduct(false);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Product Details</h2>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                placeholder="Product Name *"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>SKU (Unique Code) *</label>
              <input
                type="text"
                placeholder="SKU (Unique Code) *"
                value={editingProduct.sku}
                onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="Category"
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Unit Price ($) *</label>
              <input
                type="number"
                placeholder="Price *"
                value={editingProduct.unitPrice}
                onChange={(e) => setEditingProduct({...editingProduct, unitPrice: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Reorder Level *</label>
              <input
                type="number"
                placeholder="Reorder Level *"
                value={editingProduct.reorderLevel}
                onChange={(e) => setEditingProduct({...editingProduct, reorderLevel: e.target.value})}
              />
            </div>
            <div className="modal-buttons">
              <button className="btn btn-success" onClick={saveProductEdit}>Save Changes</button>
              <button className="btn btn-danger" onClick={() => setShowEditProduct(false)}>Cancel</button>
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
                  {getProductName(item.productId)} - Stock: {item.quantityOnHand}
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
              <button className="btn btn-primary" onClick={addStock}>Add Stock (IN)</button>
              <button className="btn btn-warning" onClick={reduceStock}>Reduce Stock (OUT)</button>
              <button className="btn btn-danger" onClick={() => setShowStockOps(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table & Filter Toolbar */}
      <div className="inventory-table">
        <h2>Current Inventory</h2>

        {/* Real-time Search and Filter Panel */}
        <div className="filter-bar">
          <div className="filter-group search">
            <label>Search Product</label>
            <input
              type="text"
              className="filter-control"
              placeholder="Search by Name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Category</label>
            <select
              className="filter-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Stock Status</label>
            <select
              className="filter-control"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              className="filter-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="id">Product ID</option>
              <option value="name">Product Name</option>
              <option value="quantity">Stock Quantity</option>
              <option value="price">Unit Price</option>
            </select>
          </div>

          {(searchTerm || selectedCategory || stockStatusFilter !== 'all' || sortBy !== 'id') && (
            <div className="filter-group action">
              <button className="btn-clear" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setStockStatusFilter('all');
                setSortBy('id');
              }}>
                Clear
              </button>
            </div>
          )}
        </div>

        {inventory.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Click "Add New Product" to get started!</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="no-results">
            <p>No products match your search/filter criteria.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="td-image">Image</th>
                <th>ID</th>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => {
                const isLowStock = item.quantityOnHand < item.reorderLevel;
                const prod = getProduct(item.productId);
                const prodName = prod ? prod.name : `Product ${item.productId}`;
                
                return (
                  <tr key={item.inventoryId} className={isLowStock ? 'low-stock-row' : ''}>
                    <td className="td-image">
                      {prod && prod.image ? (
                        <div className="product-thumbnail-wrapper">
                          <img
                            src={prod.image}
                            alt={prodName}
                            className="product-thumbnail"
                            onClick={() => setLightboxImage({ url: prod.image, title: prodName })}
                            title="Click to view full size"
                          />
                        </div>
                      ) : (
                        <div className="product-thumbnail-placeholder" title="No image uploaded">
                          {prodName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td>{item.productId}</td>

                    <td><code className="sku-badge">{getProductSku(item.productId)}</code></td>
                    <td><strong>{getProductName(item.productId)}</strong></td>
                    <td>{getProductCategory(item.productId)}</td>
                    <td>{getProductPrice(item.productId)}</td>
                    <td className={isLowStock ? 'low-stock font-bold' : ''}>

                    <td>{prodName}</td>
                    <td className={isLowStock ? 'low-stock' : ''}>

                      {item.quantityOnHand}
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>
                      {isLowStock ? (
                        <span className="badge badge-danger">Low Stock!</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-small btn-edit" onClick={() => handleEditClick(item)}>
                          Edit
                        </button>
                        <button className="btn btn-small btn-delete" onClick={() => handleDeleteClick(item.productId)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>&times;</button>
            <img src={lightboxImage.url} alt={lightboxImage.title} className="lightbox-img" />
            <div className="lightbox-title">{lightboxImage.title}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Inventory Management System - SCM IMS</p>
      </footer>
    </div>

    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>

  );
}

export default App;