// 实现token获取逻辑
export const getToken = () => {
  // 根据实际项目情况修改token获取方式
  // 示例：从localStorage获取token
  return localStorage.getItem('token') || '';
};