import { NextApiRequest, NextApiResponse } from 'next/dist/shared/lib/utils';
import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { formatDefaultUsername, validateEnsDomainName } from 'apps/web/src/utils/usernames';
import {
  DOMAIN,
  inputSearchValueFrame,
  setYearsFrame,
} from 'apps/web/pages/api/basenames/frame/frameResponses';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body: FrameRequest = req.body;
    const { untrustedData } = body;
    const targetName: string = encodeURIComponent(untrustedData.inputText);

    const { valid, message } = validateEnsDomainName(targetName);
    if (!valid) {
      throw new Error(`Invalid name: ${message}`);
    }

    const isNameAvailableResponse = await fetch(
      `${DOMAIN}/api/basenames/${targetName}/isNameAvailable`,
    );
    const { nameIsAvailable } = await isNameAvailableResponse.json();
    if (!nameIsAvailable) {
      throw new Error('Name not available.');
    }

    const formattedTargetName = await formatDefaultUsername(targetName);
    return res
      .status(200)
      .setHeader('Content-Type', 'text/html')
      .send(setYearsFrame(targetName, formattedTargetName));
  } catch (error) {
    return res
      .status(200)
      .setHeader('Content-Type', 'text/html')
      .send(inputSearchValueFrame(String(error)));
  }
}
