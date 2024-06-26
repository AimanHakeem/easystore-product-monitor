export interface ProductData {
  id: number;
  name: string;
  price: number;
  handle: string;
  title: string;
  sellerUrl: string;
  images: string;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    available: boolean;
    inventory_quantity: number;
  }>;
  available: boolean;
}

export interface Variants {
  id: number;
  title: string;
  price: number;
  available: boolean;
  inventory_quantity: number;
}

export interface DiscordData extends Variants{
  title: string;
  description: string;
  sellerUrl: string;
  url: string;
  color: number;
  handle: string;
  timestamp: string;
  variants: Variants[];
  footer: {
    text: string;
    icon_url: string;
  };
  thumbnail: {
    url: string;
  };
  images: string;
}

export interface APIEmbedField {
  name: string;
  value: string;
  inline: boolean;
}
export interface ProductModel extends ProductData {
  url: string;
  lastUpdate: string;
  image: string;
  updated_at: string;
}
export interface ProxyConfig {
  enabled: boolean;
  proxyListPath: string;
}

export interface StoreConfig {
  _id: string;
  url: string;
  proxy: ProxyConfig;
}

export interface DiscordMessageSettings {
  botImage: string;
  botName: string;
  footerDescription: string;
  footerImage: string;
  timeOfNotification: boolean;
}

export interface Config {
  stores: StoreConfig[];
  pollingInterval: number;
  webhook_url: string[];
  discord_message_settings: DiscordMessageSettings;
}


// export interface Store {
//   name: string;
//   url: string;
//   proxy: {
//     enabled: boolean;
//     proxyListPath: string;
//   };
// }