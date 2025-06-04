import { z } from "zod";

export const ShippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number is required"),
  address1: z.string().min(1, "Street address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  stateCode: z.string().min(1, "State is required"),
  postalCode: z.string().min(5, "ZIP code is required"),
  countryCode: z.string().min(1, "Country is required"),
});

export type ShippingAddresFormValues = z.infer<typeof ShippingAddressSchema>;

export const PaymentSchema = z.object({
  holder: z.string().min(1, "Name on card is required"),
  maskedNumber: z.string().min(1, "Card number is required"),
  expirationMonth: z.string().min(1, "Expiry month is required"),
  expirationYear: z.string().min(1, "Expiry year is required"),
  cvv: z
    .string()
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV must be at most 4 digits"),
  cartType: z.string(),
});

export type PaymentFormValues = z.infer<typeof PaymentSchema>;
