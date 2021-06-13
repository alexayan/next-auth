import { createHash, randomBytes } from "crypto"
import adapterErrorHandler from "../../../adapters/error-handler"

/**
 * Starts an e-mail login flow, by generating a token,
 * and sending it to the user's e-mail.
 * @param {string} identifier
 * @param {import("types/internals").InternalOptions} options
 */
export default async function email(identifier, options) {
  const { baseUrl, basePath, adapter, logger } = options

  /** @type {import("types/providers").EmailConfig} */
  const provider = options.provider
  const { generateVerificationToken, sendVerificationRequest } = provider

  const { createVerificationRequest } = adapterErrorHandler(
    await adapter.getAdapter(options),
    logger
  )

  let token = await generateVerificationToken?.()
  token = token ?? randomBytes(32).toString("hex")

  const params = new URLSearchParams({ token, email: identifier })
  const url = `${baseUrl}${basePath}/callback/${provider.id}?${params}`

  const hashedToken = hashToken(token, options)
  await createVerificationRequest({ identifier, url, provider, hashedToken })
  try {
    await sendVerificationRequest({ identifier, url, provider, token, baseUrl })
  } catch (error) {
    logger.error("SEND_VERIFICATION_EMAIL_ERROR", identifier, error)
    throw new Error("SEND_VERIFICATION_EMAIL_ERROR")
  }
}

/**
 * @todo Use bcrypt or a more secure method
 * @param {string} token
 * @param {import("types/internals").InternalOptions} options
 */
export function hashToken(token, options) {
  // Prefer provider specific secret, but use default secret if none specified
  const secret = options.provider.secret ?? options.secret
  return createHash("sha256").update(`${token}${secret}`).digest("hex")
}
