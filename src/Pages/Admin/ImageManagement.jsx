import './Order.css';
import { FaSearch, FaUpload, FaTrash, FaSpinner, FaExclamationCircle, FaImage } from "react-icons/fa";
import { useEffect, useState } from "react";
import { imageAPI } from "../../services/API";
import { getImageManagementUrl } from "../../utils/imageUtils";

export default function ImageManagement() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([
    'vehicle-brand',
    'vehicle-model',
    'vehicle-variant',
    'vehicle-inventory',
    'color-swatch',
    'promotion',
    'other'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('vehicle-brand');
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);

  // Lấy danh sách hình ảnh
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      // Thử lấy theo category trước, nếu không có thì lấy tất cả
      try {
        const res = await imageAPI.getImages(selectedCategory);
        const imagesData = res.data?.data || res.data || [];
        setImages(Array.isArray(imagesData) ? imagesData : []);
      } catch (categoryErr) {
        // Nếu không có endpoint theo category, thử lấy tất cả
        try {
          const res = await imageAPI.getAllImages();
          const allImages = res.data?.data || res.data || [];
          // Lọc theo category
          const filtered = Array.isArray(allImages) 
            ? allImages.filter(img => !img.category || img.category === selectedCategory)
            : [];
          setImages(filtered);
        } catch (allErr) {
          console.warn("Không thể lấy danh sách hình ảnh:", allErr);
          setImages([]);
        }
      }
    } catch (err) {
      console.error("Lỗi khi lấy hình ảnh:", err);
      setError("Không thể tải danh sách hình ảnh. Vui lòng thử lại sau.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  // Upload hình ảnh
  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một file!");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      // Upload multiple files
      if (uploadFiles.length > 1) {
        uploadFiles.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('category', selectedCategory);
        await imageAPI.uploadMultiple(formData);
      } else {
        // Upload single file
        formData.append('file', uploadFiles[0]);
        
        // Use specific upload endpoint based on category
        switch (selectedCategory) {
          case 'vehicle-brand':
            await imageAPI.uploadVehicleBrand(formData);
            break;
          case 'vehicle-model':
            await imageAPI.uploadVehicleModel(formData);
            break;
          case 'vehicle-variant':
            await imageAPI.uploadVehicleVariant(formData);
            break;
          case 'vehicle-inventory':
            await imageAPI.uploadVehicleInventory(formData);
            break;
          case 'color-swatch':
            await imageAPI.uploadColorSwatch(formData);
            break;
          default:
            await imageAPI.upload(formData);
        }
      }

      alert("Upload hình ảnh thành công!");
      setShowUploadModal(false);
      setUploadFiles([]);
      await fetchImages();
    } catch (err) {
      console.error("Lỗi khi upload:", err);
      alert("Upload thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Xóa hình ảnh
  const handleDelete = async (category, filename) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này không?")) return;
    try {
      setDeleting(filename);
      await imageAPI.deleteImage(category, filename);
      alert("Xóa hình ảnh thành công!");
      await fetchImages();
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Xóa thất bại! " + (err.response?.data?.error || err.message));
    } finally {
      setDeleting(null);
    }
  };

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
  };

  // Tìm kiếm
  const filteredImages = images.filter((img) => {
    if (!img) return false;
    const keyword = searchTerm.toLowerCase();
    return (
      (img.filename && String(img.filename).toLowerCase().includes(keyword)) ||
      (img.category && String(img.category).toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="customer">
      <div className="title-customer">
        <span className="title-icon">🖼️</span>
        Quản lý hình ảnh
      </div>

      <div className="title2-customer">
        <div>
          <h2>Danh sách hình ảnh</h2>
          <p className="subtitle">{images.length} hình ảnh tổng cộng</p>
        </div>
        <button className="btn-add" onClick={() => setShowUploadModal(true)}>
          <FaUpload className="btn-icon" />
          Upload hình ảnh
        </button>
      </div>

      {/* Bộ lọc */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Danh mục</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="title3-customer">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên file..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-banner">
          <FaExclamationCircle />
          <span>{error}</span>
          <button onClick={fetchImages}>Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách hình ảnh...</p>
        </div>
      ) : (
        <div className="customer-table-container">
          {filteredImages.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {filteredImages.map((img, idx) => {
                const imageUrl = img.url || img.imageUrl || getImageManagementUrl(img.category || selectedCategory, img.filename);
                return (
                  <div key={idx} style={{ 
                    background: 'white', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                  }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={img.filename || `Image ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      display: imageUrl ? 'none' : 'flex',
                      width: '100%',
                      height: '150px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}>
                      <FaImage style={{ fontSize: '48px', color: '#667eea' }} />
                    </div>
                    <p style={{ margin: '5px 0', fontWeight: '500', wordBreak: 'break-word' }}>
                      {img.filename || `Image ${idx + 1}`}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                      {img.category || selectedCategory}
                    </p>
                    {img.size && (
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                        {(img.size / 1024).toFixed(2)} KB
                      </p>
                    )}
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(img.category || selectedCategory, img.filename)}
                      disabled={deleting === img.filename}
                      style={{ marginTop: '10px' }}
                      title="Xóa"
                    >
                      {deleting === img.filename ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🖼️</div>
              <h3>Chưa có hình ảnh nào</h3>
              <p>Bắt đầu bằng cách upload hình ảnh mới</p>
            </div>
          )}
        </div>
      )}

      {/* Modal upload */}
      {showUploadModal && (
        <div className="popup-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Upload hình ảnh</h2>
              <button className="popup-close" onClick={() => setShowUploadModal(false)}>×</button>
            </div>
            <div className="popup-content">
              <div className="form-group">
                <label>Danh mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Chọn file (có thể chọn nhiều)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                {uploadFiles.length > 0 && (
                  <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    Đã chọn {uploadFiles.length} file(s)
                  </p>
                )}
              </div>
            </div>
            <div className="popup-footer">
              <button className="btn-secondary" onClick={() => setShowUploadModal(false)}>Hủy</button>
              <button 
                className="btn-primary" 
                onClick={handleUpload}
                disabled={uploading || uploadFiles.length === 0}
              >
                {uploading ? 'Đang upload...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

