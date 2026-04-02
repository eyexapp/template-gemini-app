import type { ImagePart } from '@/core/types';

export async function fileToImagePart(file: File): Promise<ImagePart> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return {
    type: 'image',
    data: btoa(binary),
    mimeType: file.type,
  };
}

export async function urlToImagePart(url: string): Promise<ImagePart> {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], 'image', { type: blob.type });
  return fileToImagePart(file);
}
