export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Error reading file as base64'));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

export function base64ToFile(base64String: string, mimeType: string) {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const newTab = window.open(url, '_blank');
  if (newTab) {
    newTab.focus();
  }
  return;
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  // a.download = '123';
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
