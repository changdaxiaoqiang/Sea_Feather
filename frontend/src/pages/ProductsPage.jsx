import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Coins, Package, Check, Sparkles, ArrowRight } from 'lucide-react';
import { getProducts, redeemProduct, getMemberProfile } from '../api';
import { getOpenId } from '../utils';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const openid = getOpenId();
      const [productsRes, memberRes] = await Promise.all([
        getProducts({ status: 'active' }),
        getMemberProfile(openid)
      ]);
      setProducts(productsRes.data);
      setMember(memberRes);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (product) => {
    if (member.points < product.points_required) {
      alert('积分不足');
      return;
    }
    
    if (product.stock <= 0) {
      alert('库存不足');
      return;
    }

    setRedeemingId(product.id);
    try {
      const openid = getOpenId();
      await redeemProduct(product.id, openid);
      alert('兑换成功！');
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || '兑换失败');
    } finally {
      setRedeemingId(null);
      setShowConfirm(null);
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-dark-900">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative px-6 pt-14 pb-6 bg-gradient-to-b from-brand-primary/10 to-transparent"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-11 h-11 bg-dark-800/80 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-wide">
            积分<span className="text-gradient">商城</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Coins className="w-4 h-4 text-brand-primary" />
            <span className="text-white/60 text-sm">
              当前积分: <span className="text-brand-primary font-semibold">{member?.points || 0}</span>
            </span>
          </div>
        </div>
      </motion.div>

      <div className="px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full"
            />
            <p className="mt-4 text-white/50 text-sm">加载中...</p>
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center mb-4">
              <Package className="w-12 h-12 text-white/20" />
            </div>
            <p className="text-white/50 text-lg mb-2">暂无商品</p>
            <p className="text-white/30 text-sm">敬请期待</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-glass rounded-3xl overflow-hidden group"
              >
                <div className="relative h-36 overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                      <Package className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="font-display text-lg font-bold text-white/80">已兑完</span>
                    </div>
                  )}
                  
                  {product.stock > 0 && product.stock <= 3 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/80 rounded-lg">
                      <span className="text-white text-xs font-bold">仅剩{product.stock}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-brand-primary" />
                      <span className="font-display text-lg font-bold text-gradient">{product.points_required}</span>
                    </div>
                    <span className="text-white/40 text-xs">库存 {product.stock}</span>
                  </div>
                  
                  <button
                    onClick={() => setShowConfirm(product)}
                    disabled={product.stock <= 0 || member.points < product.points_required}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      product.stock <= 0
                        ? 'bg-dark-700 text-white/40 cursor-not-allowed'
                        : member.points < product.points_required
                        ? 'bg-dark-700 text-white/40 cursor-not-allowed'
                        : 'btn-primary text-white'
                    }`}
                  >
                    {product.stock <= 0 ? '已兑完' : member.points < product.points_required ? '积分不足' : '立即兑换'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            onClick={() => setShowConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-800 rounded-3xl max-w-sm w-full p-6 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-brand-primary" />
                <h3 className="font-display text-xl font-bold">确认兑换</h3>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                {showConfirm.image && (
                  <img 
                    src={showConfirm.image} 
                    alt={showConfirm.name} 
                    className="w-20 h-20 rounded-2xl object-cover" 
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{showConfirm.name}</h4>
                  <p className="font-display text-2xl font-bold text-gradient">{showConfirm.points_required} 积分</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 bg-dark-900/50 rounded-xl">
                  <span className="text-white/50">兑换后余额</span>
                  <span className="text-white font-semibold">
                    {member.points - showConfirm.points_required} 积分
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 py-3 border border-white/20 rounded-xl font-semibold text-white/70 hover:bg-white/5 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleRedeem(showConfirm)}
                  disabled={redeemingId === showConfirm.id}
                  className="flex-1 btn-primary py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                >
                  {redeemingId === showConfirm.id ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      兑换中...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      确认兑换
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;