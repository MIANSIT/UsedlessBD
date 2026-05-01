import { NotFoundPage } from '@payloadcms/next/views'
import config from '@payload-config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NotFound = (props: any) => NotFoundPage({ ...props, config })

export default NotFound
