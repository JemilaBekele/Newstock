import authConfig from '@/auth.config';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authConfig);

    if (!session?.user?.accessToken) {
      return res.status(401).json({ message: 'Unauthorized: No access token' });
    }

    const accessToken = session.user.accessToken;

    return res
      .status(200)
      .json({ message: 'Access token retrieved successfully', accessToken });
  } catch  {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
