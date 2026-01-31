import { generateEntitySecret, registerEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';
import { CIRCLE_API_KEY, ENTITY_SECRET } from '../utils/constants';

async function createCircleEntitySecret() {
    const entitySecret = await generateEntitySecret();
    return entitySecret;
}
async function registerCipherText() {
    return await registerEntitySecretCiphertext({
        apiKey:
            CIRCLE_API_KEY,
        entitySecret: ENTITY_SECRET,
        recoveryFileDownloadPath: "/tmp",
    });
}
export { createCircleEntitySecret, registerCipherText };