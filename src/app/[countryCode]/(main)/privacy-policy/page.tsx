import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how REVETIR collects, uses, and protects your personal information in accordance with GDPR and CCPA.",
}

export default function PrivacyPage() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none text-sm">
          <p className="text-gray-600 mb-8">
            Last updated October, 2025
          </p>
          
          <p className="text-gray-600 mb-8">
            REVETIR LLC (referred to as "REVETIR", "we", "us" or "our") is an e-commerce and technology company with its principal office at 2 Park Avenue, 20th Floor, New York, NY 10016. We respect your privacy and are committed to protecting your personal information in accordance with applicable laws (including the EU General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA)). This Privacy Policy explains how we collect, use, disclose and protect your personal data when you use our website or purchase our products. It also describes your privacy rights under applicable laws and how to exercise them. By using our website or providing your information to REVETIR, you agree to the practices described in this policy.
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Personal Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect personal data that you provide directly to us when you register, place an order, subscribe to our marketing communications, or otherwise interact with our site. <strong>Categories of information we collect include:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Contact and Identifiers:</strong> Your name, email address, phone number, and billing/shipping address.</li>
              <li><strong>Account and Login Data:</strong> Username and password, order history, and customer identifiers.</li>
              <li><strong>Payment Information:</strong> Payment details required to process your order (handled securely by our payment processor, Stripe) – we do not see or store full credit card numbers. (Stripe encrypts and tokenizes your payment info in a PCI-compliant manner, so we only receive confirmation that payment was made.)</li>
              <li><strong>Device and Browsing Data:</strong> Your IP address, device type, browser type, and website usage data (such as pages viewed, items clicked, and search queries on our site). This includes data collected through cookies and similar tracking technologies.</li>
              <li><strong>Cookies and Online Identifiers:</strong> We use cookies and similar technologies to recognize your device and preferences, to enable shopping cart functionality, to remember your login and language preferences, to analyze site usage, and to personalize your experience. (See below for details on cookies.)</li>
              <li><strong>Other Volunteered Data:</strong> Any other information you voluntarily provide (such as when you contact customer support or participate in a survey).</li>
            </ul>
            <br></br>
            <p className="text-gray-600 mb-4">
              These categories align with legal requirements to disclose what types of personal data we collect. We collect most data directly from you; some may be obtained automatically (e.g. via cookies) or from service providers (such as shipping carriers after you place an order). We do <strong>not</strong> collect highly sensitive personal data (like race, health, religion, etc.) except as may be incidentally provided in a resume for hiring (which is not applicable here).
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Personal Data</h2>
            <p className="text-gray-600 mb-4">
              We use your information for business and commercial purposes, consistent with what we disclosed to you when we collected it. The main purposes are:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Order Processing and Fulfillment:</strong> To process and ship your orders, communicate with you about your purchases, provide customer service, and issue invoices or refunds.</li>
              <li><strong>Account Management:</strong> To create and maintain your customer account, authenticate your identity when you log in, and manage your passwords and preferences.</li>
              <li><strong>Communication:</strong> To send you transactional messages (such as order confirmations and shipping notices) and, if you opt in, promotional marketing emails about products, sales, and updates. You can unsubscribe from marketing messages at any time using the link in our emails or through your account settings. You may also update your communication preferences or withdraw consent to receive marketing at any time.</li>
              <li><strong>Personalization and Improvement:</strong> To personalize your experience (such as showing you product recommendations or language/currency settings) and to analyze and improve our website and offerings. For example, we analyze browsing data to understand which products and pages are popular and to optimize our site's performance.</li>
              <li><strong>Fraud Prevention and Compliance:</strong> To detect and prevent fraud (e.g. payment fraud) and to comply with legal obligations (such as tax, financial, and accounting requirements). We may also use data to enforce our Terms & Conditions and protect our legal rights if needed.</li>
            </ul>
            <br></br>
            <p className="text-gray-600 mb-4">
              These processing activities are necessary for providing our services and for our legitimate business interests. For example, fulfilling your order and communicating with you are necessary to perform our contract with you, while marketing and analytics are based on your consent or on our legitimate interest to run our business responsibly. In all cases, we only use personal data for the purposes described here (as required by GDPR and CCPA). We <strong>never sell</strong> your personal information to third parties for money or any other consideration.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-600 mb-4">
              We and our partners use cookies and similar technologies to enhance your experience. <strong>Cookies</strong> are small data files placed on your device that store information such as user preferences and browsing behavior. When you visit our site, we use cookies for purposes including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required to enable core website functions (like keeping you logged in, enabling your shopping cart, and remembering your preferences).</li>
              <li><strong>Analytics Cookies:</strong> Collect information about how you use our site (e.g. pages visited, time spent, and navigation paths). We use tools like Google Analytics to analyze site performance.</li>
              <li><strong>Marketing and Advertising Cookies:</strong> To personalize advertisements and measure their effectiveness. For instance, we use Meta (Facebook) and Google advertising services to show you relevant product ads on third-party sites. These providers may also set cookies or use similar identifiers on your device.</li>
              <li><strong>Preference Cookies:</strong> To remember choices you make (such as language or currency preferences) and improve your browsing experience.</li>
            </ul>
            <br></br>
            <p className="text-gray-600 mb-4">
              We provide clear notice about cookies and obtain your consent where required by law. You can manage or reject cookies at any time via the cookie banner on our website or by adjusting your browser settings. Disabling certain cookies may affect website functionality. We do <strong>not</strong> use cookies to collect personal data from children, and we do not advertise to or profile minors. For more information on our use of cookies and how to opt out, see our Cookie Notice or contact us.
            </p>
            <p className="text-gray-600 mb-4">
              <em>"Personal information from consumers is often collected through the use of tracking technologies such as cookies."</em> We employ a cookie banner to inform users and obtain consent for non-essential cookies. For example, our banner explains cookie usage and provides links to this policy and opt-out tools. (You may also visit <a href="http://www.allaboutcookies.org" className="text-blue-600 hover:underline">www.allaboutcookies.org</a> for general information about cookies.)
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
            <p className="text-gray-600 mb-4">
              We share your personal information only with trusted third parties as necessary to provide our services or comply with the law. We <strong>do not sell or rent</strong> personal data to marketers. The main categories of third parties we share data with are:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Payment Processors:</strong> When you pay by credit card, your payment details are securely sent to Stripe, our payment processor. Stripe is a trusted third party that handles payment transactions in compliance with financial regulations. We only receive confirmation of payment and do not see your full credit card number. Stripe uses industry-standard encryption, so your payment data is fully protected.</li>
              <li><strong>Shipping and Logistics Providers:</strong> We share your name, address, and order details with shipping companies (e.g. couriers and postal services) to deliver your purchases. Those companies use your information only to fulfill the shipment.</li>
              <li><strong>IT and Service Providers:</strong> We may share data with service providers who support our business operations. This includes hosting providers, email service providers, customer support platforms, CRM systems, and others. For example, we use Google (for Analytics and Ads), Meta (Facebook/Instagram Ads), and Algolia (site search) to run our website and analyze traffic. These services may receive hashed or aggregated data for analytics and advertising (for instance, Google Analytics receives anonymized browsing statistics). We only share data with service providers under strict agreements that limit their use of data to the purposes we specify.</li>
              <li><strong>Legal and Government Authorities:</strong> We may disclose personal data to law enforcement or regulators if required by law (e.g. in response to a subpoena or legal obligation) or to protect the rights, safety, or property of REVETIR, our customers, or others.</li>
            </ul>
            <br></br>
            <p className="text-gray-600 mb-4">
              Any other disclosures of your data are subject to your explicit consent. All disclosures and transfers are done under legal safeguards. In compliance with GDPR, this policy identifies the categories of recipients of personal data. We do not share data with unrelated third parties for cross-marketing. Furthermore, any transfer of data outside your country (for example, to Stripe or Google in the U.S.) is protected by appropriate safeguards such as standard contractual clauses or adequacy decisions as required by law.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-gray-600 mb-4">
              We retain your personal information only as long as needed to fulfill the purposes described above or to comply with legal obligations. For example, we may keep order and billing records for up to 7 years as required for accounting and tax purposes. We retain marketing and analytics data only for as long as necessary to improve our services. When information is no longer needed, we either delete it or anonymize it in a secure manner. As a principle, personal data are "retained only as long as necessary for the fulfillment of [the] purposes" for which they were collected. For requests you make (such as account deletion), we will promptly delete or de-identify your data unless there is a legal reason to retain it (e.g. fraud prevention). You can also update or delete your account data anytime via your user account or by contacting us.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p className="text-gray-600 mb-4">
              We use reasonable technical and organizational measures to protect your personal data. Our website uses industry-standard encryption (HTTPS/TLS) to safeguard data in transit. We limit access to personal information to authorized employees and contractors who need it to perform their duties. Our servers and databases are secured against unauthorized access. Sensitive data such as payment information is encrypted and tokenized by our payment processor (Stripe) and is not accessible to our staff. We regularly review our security procedures and update them as needed. While no Internet system can be 100% secure, we are committed to protecting your information with safeguards appropriate to its sensitivity.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Privacy Rights</h2>
            <p className="text-gray-600 mb-4">
              Under data protection laws, you have the following rights with respect to your personal data:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Access and Portability:</strong> You have the right to request access to the personal data we hold about you, and in some cases to obtain a copy in a portable format. For instance, you may request your order history or account details.</li>
              <li><strong>Correction:</strong> You can request that we correct any inaccurate or incomplete information we have about you (such as a wrong shipping address).</li>
              <li><strong>Erasure (Right to be Forgotten):</strong> You can request that we delete your personal data when it is no longer needed for the purposes stated or if you withdraw consent. (We will comply unless we have a legal obligation to retain it.)</li>
              <li><strong>Restriction and Objection:</strong> In certain circumstances, you may ask us to restrict processing of your data or to object to our processing (for example, for direct marketing purposes). If you object to marketing communications, we will stop sending them.</li>
              <li><strong>Withdraw Consent:</strong> Where processing is based on your consent (e.g. cookies or email marketing), you can withdraw that consent at any time. Withdrawal does not affect the lawfulness of processing before you withdrew consent.</li>
              <li><strong>Lodge a Complaint:</strong> You have the right to lodge a complaint with a data protection authority (e.g. the supervisory authority in your country) if you believe our processing violates the law.</li>
            </ul>
            <br></br>
            <p className="text-gray-600 mb-4">
              We provide at least two methods for you to exercise these rights. You can manage much of your data yourself by logging into your account. Alternatively, you may email us at <a href="mailto:care@revetir.com" className="text-blue-600 hover:underline"><strong>care@revetir.com</strong></a> (with "Privacy" in the subject line) to make requests. We will respond to your request within the time frame required by law (typically 30 days for GDPR) and will not charge you a fee for exercising any of these rights. If you make a request, we will verify your identity before fulfilling it.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">California Privacy Rights</h3>
            <p className="text-gray-600 mb-4">
              If you are a California resident, the CCPA gives you additional rights concerning your personal information. In particular, you have the right to: request disclosure of what personal information we have collected about you; request deletion of your personal information; and opt out of the sale or sharing of your personal information. (Note: REVETIR does <em>not</em> sell your personal information, but we still honor opt-out requests as a matter of policy.) California law also gives you the right to non-discrimination for exercising your privacy rights and to correct inaccurate data. To exercise any California privacy right, you may use the same contact methods listed above (your account or email). We will provide the required privacy notices and disclosures for California residents as mandated by law.
            </p>
            <p className="text-gray-600 mb-4">
              We take these rights seriously. For example, under the CCPA we will provide you with details about the categories of data collected and shared in the past 12 months, the purposes of collection, and the third parties with whom data is shared. We maintain a "Do Not Sell or Share My Personal Information" link on our website for California users (even though we do not currently sell data) to comply with legal requirements. We do not discriminate against customers who exercise any of their privacy rights.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Minors and Age Restrictions</h2>
            <p className="text-gray-600 mb-4">
              Our website and services are intended for adults. We require users to be at least 18 years old. We do not knowingly collect personal data from individuals under 18. If we learn that we have inadvertently received personal information from a minor, we will delete such information as soon as possible. By using our site, you affirm that you are 18 or older.
            </p>
          </section>
          
                      <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. When we make material changes, we will update the "Last updated" date at the top of this page and notify you (for example, by email) if appropriate. California law requires that we review this policy at least once every 12 months, and we follow that practice (even if no changes are needed). We encourage you to revisit this Privacy Policy regularly to stay informed about how we handle your data.
              </p>
            </section>
            
            <div className="border-t border-b border-gray-300 py-4 mb-8">
              <p className="text-gray-600 font-bold text-center">
                You have the right to refuse your consent to the provision of your personal information by REVETIR, in which case you will not be able to create an account with REVETIR or purchase REVETIR products.
              </p>
            </div>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">How to Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about this Privacy Policy, or if you would like to exercise your privacy rights, please contact us by email at <a href="mailto:care@revetir.com" className="text-blue-600 hover:underline"><strong>care@revetir.com</strong></a> (use the subject line "Privacy"). We will respond to your inquiries or requests as promptly as possible.
              </p>
              <p className="text-gray-600 mb-4">
                Thank you for trusting REVETIR with your personal information. We are committed to keeping that information secure and using it responsibly.
              </p>
            </section>
        </div>
      </div>
    </div>
  )
} 