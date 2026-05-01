import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Returns a Payload instance. In Next.js dev the module cache keeps
 * it as a singleton automatically.
 */
export const getPayloadClient = async () => getPayload({ config })
