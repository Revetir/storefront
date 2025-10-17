"use client"

export default function ManageAccountPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Creating An Account</h1>
        <p className="mb-4">
          Creating an account will allow you to:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
          <li>Keep track of current orders and view previous purchases</li>
          <li>Request a return directly from your account</li>
          <li>Place orders with greater ease; all of your billing and shipping information is kept on file</li>
                        <li>Use exclusive promotional codes for members only</li>
        </ul>
        <p className="mb-4">
          Note that you will receive an email with a link to verify your email address, please be sure to confirm your email to finalize the account creation.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Guest Orders</h2>
        <p className="mb-8">
          To modify any order(s) placed as a guest you must create a REVETIR account using the same e-mail address used to place the guest order(s).
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Forgot Your Password</h2>
        <p className="mb-4">
          If you have forgotten or misplaced your REVETIR account password, you will be able to follow this link very soon.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Account-related Inquiries & Data Protection</h2>
        <p className="mb-4">
          At REVETIR, you have control over your personal information. As a customer, you may access your account at any time by logging into your account online.
        </p>
        <p className="mb-4">
          If you have an account, you may access it at any time on the Login page.
        </p>
        <p className="mb-4">
          If you have placed an order as a guest, you may create an account with the email you used for a previous purchase and access your account at any time on the Login page.
        </p>
        <p className="mb-4">
          You may also download your personal information. We will provide it to you in a structured, commonly used and machine-readable format.
        </p>
        <p className="mb-8">
          You can also request that your account be deleted by following the instructions in the "Contact Us" section below. At this point, your account will be deleted as soon as any outstanding issue, such as your right to return merchandise according to our return policy, is resolved.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Contact Us</h2>
        <p>
          To exercise your rights pursuant to the present section, please contact us via e-mail at care@revetir.com.
        </p>
      </div>
    </div>
  )
} 