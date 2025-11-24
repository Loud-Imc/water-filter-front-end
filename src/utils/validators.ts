import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  roleId: yup.string().required("Role is required"),
  regionId: yup.string().nullable(),
});

export const quickAddTehcnicianSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  roleId: yup.string().required('Role is required'),
  regionId: yup.string().required('Region is required'),
  phone: yup.string().required('Phone is required'),
});

export const userSchema = yup.object({
  name: yup.string().min(2).required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  roleId: yup.string().required(),
  regionId: yup.string().when("$selectedRoleName", {
    is: "Technician",
    then: (schema) => schema.required("Region is required for technicians"),
    otherwise: (schema) => schema.notRequired(),
  }),

  phone: yup.string().required(),
});

export const serviceRequestSchema = yup.object({
  type: yup
    .string()
    .oneOf([
      "SERVICE",
      "INSTALLATION",
      "RE_INSTALLATION",
      "COMPLAINT",
      "ENQUIRY",
    ])
    .required("Type is required"),
  description: yup
    .string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  customerId: yup.string().required("Customer is required"),
  regionId: yup.string().required("Region is required"),
});

export const customerSchema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  address: yup
    .string()
    .min(5, "Address must be at least 5 characters")
    .required("Address is required"),
  contact: yup
    .string()
    .min(10, "Contact must be at least 10 digits")
    .required("Contact is required"),
  regionId: yup.string().required("Region is required"),
});

export const roleSchema = yup.object({
  name: yup
    .string()
    .min(2, "Role name must be at least 2 characters")
    .required("Role name is required"),
  permissions: yup.object(),
});

export const regionSchema = yup.object({
  name: yup
    .string()
    .min(2, "Region name must be at least 2 characters")
    .required("Region name is required"),
});
