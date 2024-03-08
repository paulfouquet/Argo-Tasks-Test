/**
 * Check if a file name has a JSON extension
 *
 * @param fileName
 * @returns wether the file has a JSON extension
 */
export function isJson(fileName: string): boolean {
  const search = fileName.toLowerCase();
  return search.endsWith('.json');
}
