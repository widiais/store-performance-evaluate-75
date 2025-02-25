
export const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: (now.getMonth() + 1).toString().padStart(2, '0')
  };
};
