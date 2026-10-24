export interface OptionValueObj {
  name: string;
}

export interface StorefrontProductOption {
  id?: string;
  code: string;
  name: string;
  values: (string | OptionValueObj)[];
}

export interface StorefrontProductVariant {
  id: string;
  title?: string;
  price?: number;
  status?: string;
  currency?: string;
  optionValues: Record<string, string>;
  options?: Record<string, string>;
  sku?: string;
  imageUrl?: string;
}
