import { useState } from 'react';

export function useFileDragDrop(onDrop: (file: File) => void) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    Array.from(e.dataTransfer.files)
      .filter((file) => file.name.endsWith('.docx'))
      .forEach(onDrop);
  };


  return { isDragActive, handleDragOver, handleDragLeave, handleDrop };
}
