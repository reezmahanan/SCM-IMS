import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Dashboard() {
  const navigate = useNavigate();
  // State variables - like memory boxes
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockOps, setShowStockOps] = useState(false);
  
  // Form data
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: ''
  });
  
  const [stockData, setStockData] = useState({
    productId: '',
    quantity: '',
    referenceDoc: ''
  });
  
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Edit & Delete states
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductData, setEditProductData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    reorderLevel: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

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
      if (error.response && error.response.status === 401) {
        navigate('/login');
      } else {
        showMessage('Cannot connect to server! Make sure backend is running.', 'error');
      }
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
      await axios.post('http://localhost:8080/api/products', {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        unitPrice: parseFloat(newProduct.unitPrice)
      });
      
      showMessage(' Product added successfully!', 'success');
      setNewProduct({ name: '', sku: '', category: '', unitPrice: '' });
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
      showMessage(' Error adding stock', 'error');
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
        showMessage(` Sold ${stockData.quantity} units! (${res.data.previousQuantity} → ${res.data.newQuantity})`, 'success');
      } else {
        showMessage(` ${res.data.error}`, 'error');
      }
      
      setStockData({ productId: '', quantity: '', referenceDoc: '' });
      setShowStockOps(false);
      loadInventory();
    } catch (error) {
      showMessage(' Error reducing stock', 'error');
    }
  };

  // Start editing a product
  const startEdit = (product) => {
    setEditingProduct(product);
    setEditProductData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.unitPrice,
      reorderLevel: ''
    });
    setShowEditProduct(true);
  };

  // Save edited product
  const saveEditedProduct = async () => {
    if (!editProductData.name || !editProductData.sku || !editProductData.unitPrice) {
      showMessage('Please fill required fields (Name, SKU, Price)!', 'error');
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/products/${editingProduct.productId}`, {
        name: editProductData.name,
        sku: editProductData.sku,
        category: editProductData.category,
        unitPrice: parseFloat(editProductData.unitPrice),
        reorderLevel: editProductData.reorderLevel ? parseInt(editProductData.reorderLevel) : null
      });
      
      showMessage('Product updated successfully!', 'success');
      setShowEditProduct(false);
      setEditingProduct(null);
      loadInventory();
    } catch (error) {
      const text = error?.response?.data?.message || 'Error updating product';
      showMessage(text, 'error');
      console.error('editProduct error:', error);
    }
  };

  // Delete product
  const confirmDeleteProduct = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/products/${deleteProductId}`);
      
      showMessage('Product deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteProductId(null);
      loadInventory();
    } catch (error) {
      showMessage('Error deleting product', 'error');
      console.error('deleteProduct error:', error);
    }
  };

  // Get product name by ID
  const getProductName = (productId) => {
    return `Product ${productId}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="app dashboard-container">
      {/* Header */}
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Inventory Management System</h1>
          <p>Track your products and stock levels easily</p>
        </div>
        <div>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
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
            <div className="modal-buttons">
              <button className="btn btn-success" onClick={addProduct}>Save Product</button>
              <button className="btn btn-danger" onClick={() => setShowAddProduct(false)}>Cancel</button>
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
                  Product {item.productId} - Stock: {item.quantityOnHand}
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
        <h2>Current Inventory</h2>
        {inventory.length === 0 ? (
          <div className="empty-state">
            <p>No products yet. Click "Add New Product" to get started!</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => {
                const isLowStock = item.quantityOnHand < item.reorderLevel;
                return (
                  <tr key={item.inventoryId} className={isLowStock ? 'low-stock-row' : ''}>
                    <td>{item.productId}</td>
                    <td>{getProductName(item.productId)}</td>
                    <td className={isLowStock ? 'low-stock' : ''}>
                      {item.quantityOnHand}
                    </td>
                    <td>{item.reorderLevel}</td>
                    <td>
                      {isLowStock ? (
                        <span className="badge badge-danger"> Low Stock!</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-small btn-primary" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-small btn-danger" onClick={() => {
                        setDeleteProductId(item.productId);
                        setShowDeleteConfirm(true);
                      }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Product</h2>
            <input
              type="text"
              placeholder="Product Name *"
              value={editProductData.name}
              onChange={(e) => setEditProductData({...editProductData, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="SKU (Unique Code) *"
              value={editProductData.sku}
              onChange={(e) => setEditProductData({...editProductData, sku: e.target.value})}
            />
            <input
              type="text"
              placeholder="Category"
              value={editProductData.category}
              onChange={(e) => setEditProductData({...editProductData, category: e.target.value})}
            />
            <input
              type="number"
              placeholder="Price *"
              value={editProductData.unitPrice}
              onChange={(e) => setEditProductData({...editProductData, unitPrice: e.target.value})}
            />
            <input
              type="number"
              placeholder="Reorder Level"
              value={editProductData.reorderLevel}
              onChange={(e) => setEditProductData({...editProductData, reorderLevel: e.target.value})}
            />
            <div className="modal-buttons">
              <button className="btn btn-success" onClick={saveEditedProduct}>Save Changes</button>
              <button className="btn btn-danger" onClick={() => setShowEditProduct(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button className="btn btn-danger" onClick={confirmDeleteProduct}>
                Yes, Delete Product
              </button>
              <button className="btn btn-primary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Inventory Management System </p>
      </footer>
    </div>
  );
}

export default Dashboard;
