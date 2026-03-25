import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, X, Image as ImageIcon, Calculator, Users, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createActivity, updateActivity, getActivity, uploadImage, getActivityRegistrations, calculateActivity, getActivitySummary, markRegistrationPaid } from '../../api';
import CourtDisplay from '../../components/CourtDisplay';

const ALL_COURTS = [1, 2, 3, 5, 6];

const AdminActivityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const showCost = id && window.location.pathname.includes('/summary');

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [form, setForm] = useState({
    title: '',
    type: 'regular',
    activity_date: '',
    start_time: '19:00',
    end_time: '21:00',
    images: [],
    courts: [],
    location: '',
    transportation: '',
    price_activity: 30,
    price_dinner: 80,
    price_dinner_only: 50,
    max_participants: 20,
    max_waitlist: 5,
    status: 'active',
    actual_court_fee: 0,
    actual_ball_count: 0,
    actual_ball_price: 6,
  });

  useEffect(() => {
    if (isEdit) {
      loadActivity();
      loadSummary();
    }
  }, [id]);

  const loadActivity = async () => {
    try {
      const res = await getActivity(id);
      setForm({
        ...res,
        courts: res.courts || [],
        images: res.images || [],
      });
    } catch (error) {
      alert('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await getActivitySummary(id);
      setSummary(res);
      setRegistrations(res.registrations);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleCourt = (court) => {
    setForm(prev => ({
      ...prev,
      courts: prev.courts.includes(court)
        ? prev.courts.filter(c => c !== court)
        : [...prev.courts, court]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData);
      setForm(prev => ({
        ...prev,
        images: [...prev.images, res.url]
      }));
    } catch (error) {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.activity_date) {
      alert('请填写必填项');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateActivity(id, form);
      } else {
        await createActivity(form);
      }
      navigate('/admin');
    } catch (error) {
      alert(error.response?.data?.error || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalculate = async () => {
    try {
      await updateActivity(id, {
        ...form,
        courts: form.courts,
        images: form.images
      });
      const result = await calculateActivity(id);
      alert(result.message);
      loadSummary();
    } catch (error) {
      alert('计算失败');
    }
  };

  const handlePaymentMethodChange = (regId, method) => {
    setPaymentMethods(prev => ({ ...prev, [regId]: method }));
  };

  const togglePaid = async (regId, isPaid, paymentMethod) => {
    try {
      await markRegistrationPaid(regId, isPaid, paymentMethod);
      loadSummary();
    } catch (error) {
      alert('更新失败: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">{isEdit ? '编辑活动' : '新建活动'}</h1>
        {isEdit && (
          <button
            onClick={() => navigate(`/admin/activities/${id}/edit/summary`)}
            className="ml-auto px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            费用结算
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-6 space-y-6 border border-white/10">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              活动名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
              placeholder="例如：周六羽毛球活动"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">活动类型</label>
            <select
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
            >
              <option value="regular">日常活动</option>
              <option value="competition">比赛</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              活动日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.activity_date}
              onChange={(e) => handleChange('activity_date', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">开始时间</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">结束时间</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">宣传图</label>
          <div className="flex flex-wrap gap-4">
            {form.images.map((url, index) => (
              <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
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
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">占用场地</label>
          <div className="flex gap-3">
            {ALL_COURTS.map((court) => (
              <button
                key={court}
                type="button"
                onClick={() => toggleCourt(court)}
                className={`court-badge ${form.courts.includes(court) ? 'occupied' : 'vacant'} cursor-pointer`}
              >
                {court}号
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">活动地点</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
              placeholder="例如：体育中心羽毛球馆"
            />

          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">状态</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
            >
              <option value="pending">待发布</option>
              <option value="active">进行中</option>
              <option value="completed">已结束</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">交通到达</label>
          <textarea
            value={form.transportation}
            onChange={(e) => handleChange('transportation', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
            placeholder="地铁：2号线体育中心站B出口步行5分钟"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">仅活动(预估)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">¥</span>
              <input
                type="number"
                value={form.price_activity}
                onChange={(e) => handleChange('price_activity', parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">活动+晚宴(预估)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">¥</span>
              <input
                type="number"
                value={form.price_dinner}
                onChange={(e) => handleChange('price_dinner', parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">仅晚宴(预估)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">¥</span>
              <input
                type="number"
                value={form.price_dinner_only}
                onChange={(e) => handleChange('price_dinner_only', parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">报名人数上限</label>
            <input
              type="number"
              value={form.max_participants}
              onChange={(e) => handleChange('max_participants', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">候补人数上限</label>
            <input
              type="number"
              value={form.max_waitlist}
              onChange={(e) => handleChange('max_waitlist', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
            />
          </div>
        </div>

        {isEdit && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">活动结束后 - 实际费用录入</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">场地费总计</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">¥</span>
                  <input
                    type="number"
                    value={form.actual_court_fee}
                    onChange={(e) => handleChange('actual_court_fee', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="输入场地费"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">用球数</label>
                <input
                  type="number"
                  value={form.actual_ball_count}
                  onChange={(e) => handleChange('actual_ball_count', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                  placeholder="消耗球数"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">球单价</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">¥</span>
                  <input
                    type="number"
                    value={form.actual_ball_price}
                    onChange={(e) => handleChange('actual_ball_price', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="单价"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <button
                type="button"
                onClick={handleCalculate}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                计算费用
              </button>
              {summary && (
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>预计总费用: <strong className="text-amber-600">¥{summary.summary.totalExpected}</strong></span>
                  <span>已付: <strong className="text-green-600">¥{summary.summary.totalPaid}</strong></span>
                  <span>待收: <strong className="text-red-600">¥{summary.summary.unpaidAmount}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}

        {summary && registrations.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">报名成员</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {registrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{reg.nickname}</p>
                      <p className="text-xs text-white/60">
                        {reg.registration_type === 'activity' ? '仅活动' : reg.registration_type === 'both' ? '活动+晚宴' : '仅晚宴'}
                        {reg.actual_fee > 0 && ` - ¥${reg.actual_fee}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reg.actual_fee > 0 ? (
                      reg.is_paid ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> 
                          {reg.payment_method === 'wechat' ? '微信' : reg.payment_method === 'card' ? '卡扣' : '已付'}
                        </span>
                      ) : (
                        <>
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">待收 ¥{reg.actual_fee}</span>
                          <select
                            value={paymentMethods[reg.id] || 'wechat'}
                            onChange={(e) => handlePaymentMethodChange(reg.id, e.target.value)}
                            className="px-2 py-1 text-sm border rounded-lg text-gray-900"
                          >
                            <option value="wechat">微信转账</option>
                            <option value="card">会员卡扣除</option>
                            <option value="cash">现金</option>
                          </select>
                          <button
                            onClick={() => togglePaid(reg.id, true, paymentMethods[reg.id] || 'wechat')}
                            className="px-3 py-1 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
                          >
                            确认收款
                          </button>
                        </>
                      )
                    ) : (
                      <span className="px-3 py-1 bg-white/10 text-white/60 rounded-full text-sm">待计算</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-white/20">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminActivityForm;