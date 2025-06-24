export default function removeExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "");
}