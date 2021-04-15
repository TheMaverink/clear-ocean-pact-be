import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

LOGO_IMG_URL =
  'https://' +
  process.env.BUCKET_NAME +
  '.s3.' +
  process.env.BUCKET_REGION +
  '.amazonaws.com/app-images/logo.png'
