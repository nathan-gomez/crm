function debounce(func: Function, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default debounce;
