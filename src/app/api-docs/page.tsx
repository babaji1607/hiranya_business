import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import { getApiDocs } from "@/lib/swagger"

export default async function ApiDoc() {
  const spec = await getApiDocs()
  return (
    <section className="bg-white min-h-screen">
      <SwaggerUI spec={spec} />
    </section>
  )
}
