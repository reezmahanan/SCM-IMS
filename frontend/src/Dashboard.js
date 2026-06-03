import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';
const normalizeCategory = (cat) => {
  if (!cat) return 'Uncategorized';
  const trimmed = cat.trim();
  if (!trimmed) return 'Uncategorized';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};
function Dashboard() {
  const navigate = useNavigate();

  // Core State
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockOps, setShowStockOps] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('id');
  // Form State
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

  // Edit & Delete State
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductData, setEditProductData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: '',
    reorderLevel: '',
    image: null
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  // Initial Load
  useEffect(() => {
    loadInventory();
  }, []);
  // Fetch Inventory and Products simultaneously
  const loadInventory = async () => {
    try {
      const [inventoryRes, productsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/inventory'),
        axios.get('http://localhost:8080/api/products')
      ]);

      setInventory(inventoryRes.data);
      const normalizedProducts = productsRes.data.map(p => ({
        ...p,
        category: normalizeCategory(p.category)
      }));
      setProducts(normalizedProducts);

      const lowStock = inventoryRes.data.filter(item => item.quantityOnHand < item.reorderLevel);
      setLowStockItems(lowStock);
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        handleLogout();
      } else {
        showMessage('Cannot connect to server! Make sure backend is running.', 'error');
      }
    }
  };
  // Popup status messages
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };
  // Get combined details for product by ID
  const getProductDetails = (productId) => {
    return products.find(p => p.productId === productId) || {
      name: `Product ${productId}`,
      sku: 'N/A',
      category: 'N/A',
      unitPrice: 0,
      image: null
    };
  };
  // Convert uploaded image to Base64
  const handleImageUpload = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (limit to 1MB to prevent excessive DB storage)
      if (file.size > 1024 * 1024) {
        showMessage('Image too large! Limit is 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'new') {
          setNewProduct({ ...newProduct, image: reader.result });
        } else if (target === 'edit') {
          setEditProductData({ ...editProductData, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  // Add new product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.unitPrice) {
      showMessage('Please fill all required fields!', 'error');
      return;
    }
    try {
      await axios.post('http://localhost:8080/api/products', {
        name: newProduct.name,
        sku: newProduct.sku,
        category: normalizeCategory(newProduct.category),
        unitPrice: parseFloat(newProduct.unitPrice),
        image: newProduct.image
      });

      showMessage('🎉 Product added successfully!', 'success');
      setNewProduct({ name: '', sku: '', category: '', unitPrice: '', image: null });
      setShowAddProduct(false);
      loadInventory();
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
        referenceDoc: stockData.referenceDoc || 'MANUAL-IN'
      });

      showMessage(`📈 Added ${stockData.quantity} units! (Previous: ${res.data.previousQuantity} → New: ${res.data.newQuantity})`, 'success');
      setStockData({ productId: '', quantity: '', referenceDoc: '' });
      setShowStockOps(false);
      loadInventory();
    } catch (error) {
      showMessage('⚠️ Error adding stock', 'error');
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
        referenceDoc: stockData.referenceDoc || 'MANUAL-OUT'
      });

      if (res.data.success !== false) {
        showMessage(`📉 Reduced ${stockData.quantity} units! (Previous: ${res.data.previousQuantity} → New: ${res.data.newQuantity})`, 'success');
      } else {
        showMessage(`⚠️ ${res.data.error}`, 'error');
      }

      setStockData({ productId: '', quantity: '', referenceDoc: '' });
      setShowStockOps(false);
      loadInventory();
    } catch (error) {
      showMessage('⚠️ Error reducing stock', 'error');
    }
  };
  // Open Edit Modal
  const startEdit = (item) => {
    const p = getProductDetails(item.productId);
    setEditingProduct(item);
    setEditProductData({
      name: p.name,
      sku: p.sku,
      category: p.category || '',
      unitPrice: p.unitPrice,
      reorderLevel: item.reorderLevel,
      image: p.image
    });
    setShowEditProduct(true);
  };
  // Save product edits
  const saveEditedProduct = async () => {
    if (!editProductData.name || !editProductData.sku || !editProductData.unitPrice) {
      showMessage('Please fill required fields (Name, SKU, Price)!', 'error');
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/products/${editingProduct.productId}`, {
        name: editProductData.name,
        sku: editProductData.sku,
        category: normalizeCategory(editProductData.category),
        unitPrice: parseFloat(editProductData.unitPrice),
        image: editProductData.image,
        reorderLevel: editProductData.reorderLevel ? parseInt(editProductData.reorderLevel) : null
      });

      showMessage('💾 Product updated successfully!', 'success');
      setShowEditProduct(false);
      setEditingProduct(null);
      loadInventory();
    } catch (error) {
      const text = error?.response?.data?.message || 'Error updating product';
      showMessage(text, 'error');
    }
  };
  // Delete product
  const confirmDeleteProduct = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/products/${deleteProductId}`);
      showMessage('🗑️ Product deleted successfully!', 'success');
      setShowDeleteConfirm(false);
      setDeleteProductId(null);
      loadInventory();
    } catch (error) {
      showMessage('⚠️ Error deleting product', 'error');
    }
  };
  // Export report to CSV
  const exportToCSV = () => {
    const headers = ['Product ID', 'Product Name', 'SKU', 'Category', 'Unit Price ($)', 'QuantityOnHand', 'ReorderLevel', 'Status'];
    const rows = inventory.map(item => {
      const p = getProductDetails(item.productId);
      const status = item.quantityOnHand < item.reorderLevel ? 'Low Stock' : 'In Stock';
      return [
        item.productId,
        p.name || 'Unknown',
        p.sku || 'N/A',
        p.category || 'N/A',
        p.unitPrice || 0,
        item.quantityOnHand,
        item.reorderLevel,
        status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SCM_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage('📂 CSV Report downloaded!', 'success');
  };
  // Export report to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SCM Inventory Management System", 14, 22);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Inventory Report - Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Add Summary details
    const totalProductsCount = products.length;
    const totalStockQty = inventory.reduce((sum, item) => sum + item.quantityOnHand, 0);
    const lowStockQty = lowStockItems.length;
    doc.text(`Total Catalog Items: ${totalProductsCount} | Total Stock Count: ${totalStockQty} | Low Stock Warnings: ${lowStockQty}`, 14, 38);

    // Table columns & rows
    const headers = [['ID', 'Product Name', 'SKU', 'Category', 'Price ($)', 'Stock Level', 'Reorder Level', 'Status']];

    const rows = filteredInventory.map(item => {
      const p = getProductDetails(item.productId);
      const status = item.quantityOnHand < item.reorderLevel ? 'Low Stock' : 'In Stock';
      return [
        item.productId,
        p.name || 'Unknown',
        p.sku || 'N/A',
        p.category || 'N/A',
        (p.unitPrice != null) ? p.unitPrice.toFixed(2) : '0.00',
        item.quantityOnHand,
        item.reorderLevel,
        status
      ];
    });

    // Generate autotable
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 44,
      styles: { fontSize: 9, font: "helvetica" },
      headStyles: { fillColor: [15, 23, 42] }, // Slate gray header matching theme
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`SCM_Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    showMessage('📄 PDF Report downloaded!', 'success');
  };
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };
  // Dynamic values for Category filter dropdown
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  // Dynamic filter and sort logic
  const filteredInventory = inventory.filter(item => {
    const p = getProductDetails(item.productId);

    const matchesSearch = !searchTerm ||
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || p.category === selectedCategory;

    const isLowStock = item.quantityOnHand < item.reorderLevel;
    const matchesStock = stockFilter === 'ALL' ||
      (stockFilter === 'LOW_STOCK' && isLowStock) ||
      (stockFilter === 'IN_STOCK' && !isLowStock);

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    const pA = getProductDetails(a.productId);
    const pB = getProductDetails(b.productId);

    if (sortBy === 'name') {
      return (pA.name || '').localeCompare(pB.name || '');
    } else if (sortBy === 'quantity') {
      return a.quantityOnHand - b.quantityOnHand;
    } else if (sortBy === 'price') {
      return (pA.unitPrice || 0) - (pB.unitPrice || 0);
    }
    return a.productId - b.productId; // Sort by ID
  });
  // Chart Data Calculations (Top 5 items by stock level)
  const topStockItems = [...inventory]
    .map(item => ({ item, details: getProductDetails(item.productId) }))
    .sort((a, b) => b.item.quantityOnHand - a.item.quantityOnHand)
    .slice(0, 5);
  const maxQty = Math.max(...inventory.map(item => item.quantityOnHand), 10);
  // Category counts calculations for Pie Donut chart
  const categoryCounts = {};
  products.forEach(p => {
    const cat = normalizeCategory(p.category);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const totalProducts = products.length || 1;

  // Custom Donut colors
  const donutColors = ['#0f172a', '#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#ec4899'];
  return (
    <div className="app dashboard-container">
      {/* Header */}
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1>Inventory Management System</h1>
          <p>Track your products and stock levels easily</p>
          <div className="user-profile-badge">
            <span>👤 {localStorage.getItem('username') || 'Guest'}</span>
            <span className="role-tag">{localStorage.getItem('role') || 'USER'}</span>
          </div>
        </div>
        <div>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      {/* Floating Status Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      {/* Summary Cards */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{products.length}</div>
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
      {/* Dashboard Custom SVG Charts Section */}
      {inventory.length > 0 && (
        <div className="charts-grid">
          {/* Chart 1: Bar Chart (Top 5 Stock Levels) */}
          <div className="chart-card">
            <h3>📈 Top 5 Products by Stock Level</h3>
            <div className="chart-container">
              {topStockItems.length > 0 ? (
                <svg className="svg-chart" viewBox="0 0 500 250">
                  {/* Grid Lines */}
                  <line x1="50" y1="200" x2="480" y2="200" stroke="#e2e8f0" strokeWidth="2" />
                  <line x1="50" y1="125" x2="480" y2="125" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="50" y1="50" x2="480" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Bars & Labels */}
                  {topStockItems.map((data, index) => {
                    const barWidth = 45;
                    const spacing = 80;
                    const x = 70 + index * spacing;
                    const pct = data.item.quantityOnHand / maxQty;
                    const barHeight = Math.max(pct * 150, 6); // At least 6px for visibility
                    const y = 200 - barHeight;
                    return (
                      <g key={data.item.inventoryId}>
                        {/* Bar */}
                        <rect
                          className="bar-rect"
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="4"
                        />
                        {/* Value Text */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 8}
                          textAnchor="middle"
                          fill="#475569"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {data.item.quantityOnHand}
                        </text>
                        {/* Label Text */}
                        <text
                          x={x + barWidth / 2}
                          y="220"
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="10"
                          fontWeight="600"
                        >
                          {data.details.name.length > 10 ? data.details.name.substring(0, 8) + '..' : data.details.name}
                        </text>
                      </g>
                    );
                  })}
                  {/* Y-Axis Label */}
                  <text x="20" y="35" transform="rotate(-90 20 35)" fill="#94a3b8" fontSize="10" fontWeight="700">QTY</text>
                </svg>
              ) : (
                <div className="empty-state">No chart data available</div>
              )}
            </div>
          </div>
          {/* Chart 2: Donut Chart (Category Distribution) */}
          <div className="chart-card">
            <h3>🏷️ Product Categories Distribution</h3>
            <div className="chart-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {products.length > 0 ? (
                <>
                  <svg width="220" height="220" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#f1f5f9" strokeWidth="22" />
                    {(() => {
                      let localOffset = 0;
                      return Object.entries(categoryCounts).map(([cat, count], index) => {
                        const percentage = count / totalProducts;
                        const dashArray = 2 * Math.PI * 70; // Circumference
                        const strokeLength = percentage * dashArray;
                        const strokeOffset = -localOffset;

                        // Accumulate offset
                        localOffset += strokeLength;
                        const color = donutColors[index % donutColors.length];
                        return (
                          <circle
                            key={cat}
                            className="donut-segment"
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke={color}
                            strokeWidth="22"
                            strokeDasharray={`${strokeLength} ${dashArray}`}
                            strokeDashoffset={strokeOffset}
                            transform="rotate(-90 100 100)"
                          />
                        );
                      });
                    })()}
                    {/* Inner Label */}
                    <text x="100" y="98" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="800">
                      {products.length}
                    </text>
                    <text x="100" y="118" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700" letterSpacing="0.5">
                      PRODUCTS
                    </text>
                  </svg>

                  {/* Legends */}
                  <div className="chart-legend">
                    {Object.entries(categoryCounts).map(([cat, count], index) => {
                      const color = donutColors[index % donutColors.length];
                      return (
                        <div key={cat} className="legend-item">
                          <span className="legend-color" style={{ backgroundColor: color }}></span>
                          <span className="legend-name" style={{ fontWeight: '600' }}>{cat}</span>
                          <span className="legend-value" style={{ color: '#94a3b8' }}>({count})</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-state">No category data available</div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>
          ➕ Add New Product
        </button>
        <button className="btn btn-success" onClick={() => setShowStockOps(true)}>
          ⚡ Stock Operations
        </button>
        <button className="btn btn-secondary" onClick={exportToCSV}>
          📂 Export CSV Report
        </button>
        <button className="btn btn-secondary" onClick={exportToPDF}>
          📄 Export PDF Report
        </button>
      </div>
      {/* Advanced Search & Filtering Controls */}
      <div className="filter-bar">
        <div className="filter-group search">
          <label>Search Directory</label>
          <input
            type="text"
            className="filter-control"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Category Filter</label>
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
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="ALL">All Items</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock Alert</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort Catalog By</label>
          <select
            className="filter-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="id">Product ID</option>
            <option value="name">Product Name</option>
            <option value="quantity">Stock level</option>
            <option value="price">Unit Price</option>
          </select>
        </div>
        {(searchTerm || selectedCategory || stockFilter !== 'ALL' || sortBy !== 'id') && (
          <div className="filter-group action">
            <button
              className="btn-clear"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setStockFilter('ALL');
                setSortBy('id');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
      {/* Inventory Table Container */}
      <div className="inventory-table">
        <h2>Current Inventory</h2>
        {filteredInventory.length === 0 ? (
          <div className="no-results">
            <p>No inventory records matches the filters. Try adjusting your search query!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th className="td-image">Photo</th>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Levels</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map(item => {
                  const p = getProductDetails(item.productId);
                  const isLowStock = item.quantityOnHand < item.reorderLevel;

                  return (
                    <tr key={item.inventoryId} className={isLowStock ? 'low-stock-row' : ''}>
                      {/* Image Thumbnail Column */}
                      <td className="td-image">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="product-thumbnail"
                            onClick={() => {
                              setLightboxImage(p.image);
                              setLightboxTitle(p.name);
                            }}
                          />
                        ) : (
                          <div className="product-thumbnail-placeholder">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td>{item.productId}</td>
                      <td style={{ fontWeight: '600' }}>{p.name}</td>
                      <td>
                        <span className="sku-badge">{p.sku}</span>
                      </td>
                      <td>{p.category || 'N/A'}</td>
                      <td>${(p.unitPrice != null) ? p.unitPrice.toFixed(2) : '0.00'}</td>
                      <td className={isLowStock ? 'low-stock' : ''} style={{ fontWeight: '700' }}>
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
                          <button className="btn btn-small btn-edit" onClick={() => startEdit(item)}>
                            Edit
                          </button>
                          <button className="btn btn-small btn-delete" onClick={() => {
                            setDeleteProductId(item.productId);
                            setShowDeleteConfirm(true);
                          }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Lightbox Fullscreen Preview Overlay */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImage(null)}>&times;</button>
            <img src={lightboxImage} alt={lightboxTitle} className="lightbox-img" />
            <div className="lightbox-title">{lightboxTitle}</div>
          </div>
        </div>
      )}
      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Product</h2>

            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Wireless Mouse"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>SKU (Unique Code) *</label>
              <input
                type="text"
                placeholder="e.g. MOUSE-WRLS-01"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                placeholder="e.g. Electronics"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={newProduct.unitPrice}
                onChange={(e) => setNewProduct({...newProduct, unitPrice: e.target.value})}
              />
            </div>

            {/* Image Upload Input */}
            <div className="image-upload-container">
              <label>Product Cover Image</label>
              <div className="image-input-wrapper">
                <label className="file-input-btn">
                  Upload Image File
                  <input
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'new')}
                  />
                </label>
                {newProduct.image && (
                  <img src={newProduct.image} alt="Preview" className="upload-preview" />
                )}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn btn-success" onClick={addProduct}>Save Product</button>
              <button className="btn btn-secondary" onClick={() => setShowAddProduct(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Stock Operations Modal */}
      {showStockOps && (
        <div className="modal">
          <div className="modal-content">
            <h2>Stock Adjustment Panel</h2>

            <div className="form-group">
              <label>Select Product</label>
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

            <div className="form-group">
              <label>Quantity Change</label>
              <input
                type="number"
                placeholder="Enter stock count adjustment"
                value={stockData.quantity}
                onChange={(e) => setStockData({...stockData, quantity: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Reference Invoice / PO Doc</label>
              <input
                type="text"
                placeholder="e.g. PO-88091"
                value={stockData.referenceDoc}
                onChange={(e) => setStockData({...stockData, referenceDoc: e.target.value})}
              />
            </div>
            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={addStock}>Add Stock (IN)</button>
              <button className="btn btn-warning" onClick={reduceStock}>Reduce Stock (OUT)</button>
              <button className="btn btn-secondary" onClick={() => setShowStockOps(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Product Registry</h2>

            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={editProductData.name}
                onChange={(e) => setEditProductData({...editProductData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>SKU (Unique Code) *</label>
              <input
                type="text"
                value={editProductData.sku}
                onChange={(e) => setEditProductData({...editProductData, sku: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={editProductData.category}
                onChange={(e) => setEditProductData({...editProductData, category: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                value={editProductData.unitPrice}
                onChange={(e) => setEditProductData({...editProductData, unitPrice: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Reorder Level (Alert Limit)</label>
              <input
                type="number"
                value={editProductData.reorderLevel}
                onChange={(e) => setEditProductData({...editProductData, reorderLevel: e.target.value})}
              />
            </div>
            {/* Image Upload Input in Edit */}
            <div className="image-upload-container">
              <label>Product Cover Image</label>
              <div className="image-input-wrapper">
                <label className="file-input-btn">
                  Change Image File
                  <input
                    type="file"
                    className="file-input"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'edit')}
                  />
                </label>
                {editProductData.image && (
                  <img src={editProductData.image} alt="Preview" className="upload-preview" />
                )}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn btn-success" onClick={saveEditedProduct}>Save Changes</button>
              <button className="btn btn-secondary" onClick={() => setShowEditProduct(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h2>Confirm Delete Action</h2>
            <p>Are you sure you want to delete this product catalog entry? This deletes inventory and transaction history records permanently.</p>
            <div className="modal-buttons" style={{ marginTop: '20px' }}>
              <button className="btn btn-danger" onClick={confirmDeleteProduct}>
                Yes, Delete Product
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="footer">
        <p>Inventory Management System • Full Stack Admin Terminal</p>
      </footer>
    </div>
  );
}
export default Dashboard;
