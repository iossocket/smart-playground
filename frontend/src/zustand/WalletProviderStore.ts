import { useSyncExternalStore } from "react"

interface EIP6963ProviderInfo {
  rdns: string
  uuid: string
  name: string
  icon: string
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo
  provider: EIP1193Provider
}

type EIP6963AnnounceProviderEvent = {
  detail: {
    info: EIP6963ProviderInfo
    provider: Readonly<EIP1193Provider>
  }
}

interface EIP1193Provider {
  isStatus?: boolean
  host?: string
  path?: string
  sendAsync?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void
  send?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void
  request: (request: {
    method: string
    params?: Array<unknown>
  }) => Promise<unknown>
}

let providers: EIP6963ProviderDetail[] = []

const walletProviderStore = {
  value: () => providers,
  subscribe: (callback: () => void) => {
    function onAnnouncement(event: Event) {
      console.log('%c [ onAnnouncement ]-15', 'font-size:13px; background:pink; color:#bf2c9f;', event);
      const evt = (event as any) as EIP6963AnnounceProviderEvent;
      if (providers.map((p) => p.info.uuid).includes(evt.detail.info.uuid))
        return
      providers = [...providers, evt.detail]
      console.log('%c [ onAnnouncement ]-14', 'font-size:13px; background:pink; color:#bf2c9f;', providers);
      callback()
    }

    console.log('%c [ subscribe ]-22', 'font-size:13px; background:pink; color:#bf2c9f;',)
    // Listen for eip6963:announceProvider and call onAnnouncement when the event is triggered.
    window.addEventListener("eip6963:announceProvider", onAnnouncement)

    // Dispatch the event, which triggers the event listener in the MetaMask wallet.
    window.dispatchEvent(new Event("eip6963:requestProvider"))

    // Return a function that removes the event listener.
    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnouncement)
  },
}

export const useSyncProviders = () => useSyncExternalStore(walletProviderStore.subscribe, walletProviderStore.value, walletProviderStore.value)