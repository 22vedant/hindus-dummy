import crypto from "crypto"

export const generateApiKeyV1 = () => {
    const length = 16
    return crypto.randomBytes(length).toString("base64")
}

export const generateApiKeyV2 = () => {
    const length = 24
    return crypto.randomBytes(length).toString("base64")
}

const apiKey1 = generateApiKeyV1()
const apiKey2 = generateApiKeyV2()

console.log(apiKey1);
console.log(apiKey2);
