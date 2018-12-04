import { AppStore } from './shared_stores/AppStore';
import { ExchangeStore } from './shared_stores/ExchangeStore';
import { PriceStore } from './shared_stores/PriceStore';
import { CoinStore } from './shared_stores/CoinStore';
import { ConfigStore } from './ConfigStore';

export function createStores() {
  const appStore = new AppStore();
  const configStore = new ConfigStore();
  const coinStore = new CoinStore(configStore);
  const exchangeStore = new ExchangeStore(coinStore, configStore);
  const priceStore = new PriceStore(configStore);

  return {
    appStore,
    exchangeStore,
    priceStore,
    coinStore,
    configStore,
  };
}
