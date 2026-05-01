import { RootPage, generateMetadata } from '@payloadcms/next/views'
import config from '@payload-config'

export { generateMetadata }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Page = (props: any) => RootPage({ ...props, config })

export default Page
