import valid from "card-validator";
import { z } from "zod";
import { CardTypes } from "~/integrations/salesforce/enums";

export const CustomerSchema = z.object({
  customerId: z.string().optional(),
  customerNo: z.string().optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  secondName: z.string().optional(),
  password: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  login: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters"),
  enabled: z.boolean().default(true),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  phoneHome: z.string().optional(),
  phoneMobile: z
    .string()
    .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  phoneBusiness: z.string().optional(),
  fax: z.string().optional(),
  preferredLocale: z.string().optional(),
  gender: z.enum(["0", "1", "2"]).optional(),
  salutation: z.enum(["Mr.", "Mrs.", "Ms.", "Dr."]).optional(),
  title: z.string().optional(),
  suffix: z.string().optional(),
  birthday: z.date().optional(),
  note: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

export type CustomerFormData = z.infer<typeof CustomerSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const PaymentCardSchema = z
  .object({
    paymentMethodId: z.string().min(1, "Payment method is required"),

    cardType: z.nativeEnum(CardTypes, {
      errorMap: () => ({ message: "Invalid card type" }),
    }),

    number: z
      .string()
      .min(1, "Card number is required")
      .refine(
        (value) => {
          const validation = valid.number(value);
          return validation.isValid;
        },
        {
          message: "Invalid card number",
        },
      ),

    expirationMonth: z
      .number()
      .min(1, "Expiration month is required")
      .max(12, "Month must be between 1 and 12")
      .refine(
        (value) => {
          const validation = valid.expirationMonth(value.toString());
          return validation.isValid;
        },
        {
          message: "Invalid expiration month",
        },
      ),

    expirationYear: z
      .number()
      .min(new Date().getFullYear(), "Card has expired")
      .refine(
        (value) => {
          const validation = valid.expirationYear(value.toString());
          return validation.isValid;
        },
        {
          message: "Invalid expiration year",
        },
      ),

    holder: z
      .string()
      .min(1, "Cardholder name is required")
      .refine(
        (value) => {
          const validation = valid.cardholderName(value);
          return validation.isValid;
        },
        {
          message: "Invalid cardholder name",
        },
      ),
  })
  .refine(
    (data) => {
      // Validate expiration date combination
      const validation = valid.expirationDate({
        month: data.expirationMonth.toString(),
        year: data.expirationYear.toString(),
      });
      return validation.isValid;
    },
    {
      message: "Invalid expiration date",
      path: ["expirationMonth"], // This will show the error on the month field
    },
  );

export type PaymentCardFormData = z.infer<typeof PaymentCardSchema>;
