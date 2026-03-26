const OPENID_KEY = 'seafeather_openid';
const MEMBER_KEY = 'seafeather_member';
const TOKEN_KEY = 'seafeather_token';

export const getOpenId = () => localStorage.getItem(OPENID_KEY);
export const setOpenId = (openid) => localStorage.setItem(OPENID_KEY, openid);

export const getMember = () => {
  const data = localStorage.getItem(MEMBER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setMember = (member) => localStorage.setItem(MEMBER_KEY, JSON.stringify(member));

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const isLoggedIn = () => {
  return !!getOpenId() && !!getMember();
};

export const logout = () => {
  localStorage.removeItem(OPENID_KEY);
  localStorage.removeItem(MEMBER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const getWechatAuthUrl = (redirectUri) => {
  const appId = 'wx395b4fb84bc93a27';
  const encodedUri = encodeURIComponent(redirectUri);
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodedUri}&response_type=code&scope=snsapi_userinfo#wechat_redirect`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
};

export const formatTime = (time) => {
  const [h, m] = time.split(':');
  return `${h}:${m}`;
};

export const formatDateTime = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getActivityTypeName = (type) => {
  const names = {
    'competition': '比赛',
    'regular': '日常活动'
  };
  return names[type] || type;
};

export const getRegistrationTypeName = (type) => {
  const names = {
    'activity': '仅活动',
    'dinner': '仅晚宴',
    'both': '活动+晚宴'
  };
  return names[type] || type;
};

export const getStatusName = (status) => {
  const names = {
    'confirmed': '已报名',
    'waitlist': '候补中',
    'cancelled': '已取消'
  };
  return names[status] || status;
};

export const isPastActivity = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activityDate = new Date(date);
  return activityDate < today;
};

export const simulateOpenId = () => {
  const openid = localStorage.getItem(OPENID_KEY);
  if (!openid) {
    const newOpenId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(OPENID_KEY, newOpenId);
    return newOpenId;
  }
  return openid;
};
