declare global {
  interface Window {
    ethereum: any;
  }
}
// need to export an empty object to indicate compiler this file is an declaration file
export { }