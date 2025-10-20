export interface CheckoutFormData {
  email: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type CheckoutStep = 1 | 2 | 3;

export interface CheckoutFormErrors {
  email?: string;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}
