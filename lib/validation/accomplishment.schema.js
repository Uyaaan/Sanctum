import * as yup from 'yup';
import { SIGIL_KEYS } from '@/components/Sigil';

const TEXT_MAX = 2000;

export const accomplishmentSchema = yup
  .object({
    text: yup.string().trim().min(1, 'Required').max(TEXT_MAX, 'Too long').required(),
    sigil_key: yup.string().oneOf(SIGIL_KEYS).nullable(),
    occurred_on: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
      .required(),
  })
  .noUnknown();

export const sigilFilterSchema = yup.string().oneOf(SIGIL_KEYS).nullable();
