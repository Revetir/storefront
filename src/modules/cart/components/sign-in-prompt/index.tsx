import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between gap-4">
      <div>
        <Heading level="h2" className="text-lg">
          Already have an account?
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2 max-w-[85%]">
          Sign in or continue to checkout as a guest
        </Text>
      </div>
      <div className="flex-shrink-0">
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10 uppercase whitespace-nowrap !rounded-none" data-testid="sign-in-button">
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
