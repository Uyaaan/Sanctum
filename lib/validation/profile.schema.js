import * as yup from 'yup';

const TZ_REGEX = /^[A-Za-z_]+\/[A-Za-z_+\-0-9]+$/;

export const profileSchema = yup
  .object({
    display_name: yup
      .string()
      .trim()
      .max(80)
      .nullable()
      .transform((v) => (v === '' ? null : v)),
    sanctum_bell_time: yup
      .string()
      .matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM 24-hour format')
      .nullable()
      .transform((v) => (v === '' ? null : v)),
    sanctum_bell_timezone: yup
      .string()
      .matches(TZ_REGEX, 'Invalid IANA timezone')
      .default('Asia/Manila'),
  })
  .noUnknown();

export const pushSubscriptionSchema = yup
  .object({
    endpoint: yup.string().url('Invalid endpoint').required(),
    p256dh: yup.string().required(),
    auth_key: yup.string().required(),
    user_agent: yup.string().nullable(),
  })
  .noUnknown();
