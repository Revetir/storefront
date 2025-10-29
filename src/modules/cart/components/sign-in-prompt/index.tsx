import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="max-w-[85%] sm:max-w-none">
        <Heading level="h2" className="text-xl uppercase">
          Already have an account?
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          Sign in or continue to checkout as a guest.
        </Text>
      </div>
      <div className="sm:flex-shrink-0">
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10 uppercase whitespace-nowrap" data-testid="sign-in-button">
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
