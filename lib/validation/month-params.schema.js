import * as yup from 'yup';

export const yearMonthSchema = yup
  .object({
    year: yup.number().integer().min(2020).max(2100).required(),
    month: yup.number().integer().min(1).max(12).required(),
  })
  .noUnknown();
