import * as yup from 'yup';

const FIELD_MAX = 10000;
const FREEFORM_MAX = 50000;

export const structuredContentSchema = yup
  .object({
    what_i_did: yup.string().max(FIELD_MAX).default(''),
    wins: yup.string().max(FIELD_MAX).default(''),
    blockers: yup.string().max(FIELD_MAX).default(''),
    tomorrow: yup.string().max(FIELD_MAX).default(''),
  })
  .noUnknown();

export const freeformContentSchema = yup
  .object({
    content_md: yup.string().max(FREEFORM_MAX).default(''),
  })
  .noUnknown();

export const dailyLogModeSchema = yup.string().oneOf(['structured', 'freeform']).required();

export const dateParamSchema = yup
  .string()
  .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
  .required();
