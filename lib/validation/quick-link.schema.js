import * as yup from 'yup';

export const quickLinkSchema = yup
  .object({
    label: yup.string().trim().min(1, 'Required').max(80, 'Too long').required(),
    url: yup
      .string()
      .trim()
      .matches(/^https?:\/\/.+/i, 'Must be a valid http(s) URL')
      .max(2000, 'Too long')
      .required(),
  })
  .noUnknown();

export const quickLinkIdSchema = yup.string().uuid().required();
