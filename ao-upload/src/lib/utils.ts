import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenString(str: string | null) {
  if (str && str.length >= 8) {
    return str.substring(0, 4) + '...' + str.substring(str.length - 4);
  } else {
    return str;
  }
}

export function stripFileExtension(fileName: string | undefined) {
  if (fileName) {

    // Split the file name by dot
    const parts = fileName.split('.');

    // If there's no dot, return the original file name
    if (parts.length === 1) {
      return fileName;
    }

    // Remove the last part (extension) and join the remaining parts back together
    return parts.slice(0, -1).join('.');
  }
}

export async function fileToBuffer(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      const buffer = new Buffer(e.target.result);
      resolve(buffer);
    };
    reader.onerror = function (e: any) {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
}