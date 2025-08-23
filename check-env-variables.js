const c = require("ansi-colors")

const requiredEnvs = [
  {
    key: "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY",
    description:
      "Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys",
  },
  {
    key: "MEDUSA_BACKEND_URL",
    description:
      "Your production Medusa backend URL (e.g., https://your-backend.railway.app)",
  },
  {
    key: "NEXT_PUBLIC_ALGOLIA_APP_ID",
    description:
      "Your Algolia application ID for search functionality",
  },
  {
    key: "NEXT_PUBLIC_ALGOLIA_API_KEY",
    description:
      "Your Algolia search API key (public key for client-side search)",
  },
  {
    key: "NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME",
    description:
      "Your Algolia product index name (usually 'products')",
  },
]

function checkEnvVariables() {
  const missingEnvs = requiredEnvs.filter(function (env) {
    return !process.env[env.key]
  })

  if (missingEnvs.length > 0) {
    console.error(
      c.red.bold("\n🚫 Error: Missing required environment variables\n")
    )

    missingEnvs.forEach(function (env) {
      console.error(c.yellow(`  ${c.bold(env.key)}`))
      if (env.description) {
        console.error(c.dim(`    ${env.description}\n`))
      }
    })

    console.error(
      c.yellow(
        "\nPlease set these variables in your .env file or environment before starting the application.\n"
      )
    )

    process.exit(1)
  }
}

module.exports = checkEnvVariables
