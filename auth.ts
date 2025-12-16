import { getServerSession } from 'next-auth/next';
import authConfig from './auth.config';

export const auth = async () => {
  return await getServerSession(authConfig);
};
