import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, X, Image as ImageIcon } from 'lucide-react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '../../api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    image: '',
    points_required: 0,
    stock: 0,
    status: 1,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getAdminProducts();
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData);
      setForm(prev => ({ ...prev, image: res.url }));
    } catch (error) {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name) {
      alert('请填写商品名称');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, form);
      } else {
        await createProduct(form);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      alert('保存失败');
    }
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除此商品吗？')) return;
    
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (error) {
      alert('删除失败');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      image: '',
      points_required: 0,
      stock: 0,
      status: 1,
    });
  };

  const openNewForm = () => {
    resetForm();
    setEditingProduct(null);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          添加商品
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-12 text-center text-white/50 border border-white/10">
          暂无商品，点击上方按钮添加
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
              <div className="h-40 bg-white/5 relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-white/30" />
                  </div>
                )}
                {product.status !== 1 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">已下架</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">{product.name}</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-primary font-bold">{product.points_required} 积分</span>
                  <span className="text-white/60">库存 {product.stock}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">
                {editingProduct ? '编辑商品' : '添加商品'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">商品名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  placeholder="例如：羽毛球拍"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">商品图片</label>
                <div className="flex items-center gap-4">
                  {form.image ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <img src={form.image} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-white/40" />
                          <span className="text-xs text-white/60 mt-1">上传</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">所需积分</label>
                  <input
                    type="number"
                    value={form.points_required}
                    onChange={(e) => setForm(prev => ({ ...prev, points_required: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">库存数量</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm(prev => ({ ...prev, status: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                >
                  <option value={1}>上架</option>
                  <option value={0}>下架</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="flex-1 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;