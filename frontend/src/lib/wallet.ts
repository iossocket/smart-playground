export function checkMetaMask(): boolean {
  const installedMetamask = window && window.ethereum && window.ethereum.isMetaMask;
  return installedMetamask && window.ethereum.isConnected();
}

export function numToHexString(num: number): string {
  return `0x${num.toString(16)}`.toUpperCase();
}