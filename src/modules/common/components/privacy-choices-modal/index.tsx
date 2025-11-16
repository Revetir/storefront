"use client"

import React, { useState, useEffect } from "react"
import { clx } from "@medusajs/ui"
import Modal from "@modules/common/components/modal"
import { Button } from "@medusajs/ui"
import CollapsibleSection from "@modules/common/components/collapsible-section"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getPrivacyPreferences, savePrivacyPreferences, getDefaultPrivacyPreferences, PrivacyPreferences, applyPrivacyPreferences } from "@lib/util/privacy-preferences"

interface PrivacyChoicesModalProps {
  isOpen: boolean
  close: () => void
}

interface PrivacyOption {
  id: string
  title: string
  description: string
  required?: boolean
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

const PrivacyChoicesModal: React.FC<PrivacyChoicesModalProps> = ({
  isOpen,
  close,
}) => {
  const [privacyOptions, setPrivacyOptions] = useState<PrivacyOption[]>([])

  // Load privacy preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedPreferences = getPrivacyPreferences()
      const defaultPreferences = getDefaultPrivacyPreferences()
      const preferences = savedPreferences || defaultPreferences

      setPrivacyOptions([
        {
          id: "essential",
          title: "Essential Cookies",
          description: "These cookies are necessary for the website to function and cannot be disabled by us. They are usually only set in response to actions made by you which amount to a request for services, such as adding items to your bag, logging in or changing your location. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. These cookies do not store any personally identifiable information.",
          required: true,
          enabled: preferences.essential,
          onToggle: () => {} // Essential cookies cannot be disabled
        },
        {
          id: "search",
          title: "Search Cookies",
          description: "We use Algolia search services to provide fast and relevant product search functionality. These cookies help improve search results and remember your search preferences. Disabling these cookies will affect the search functionality on our website.",
          enabled: preferences.search,
          onToggle: (enabled: boolean) => {
            setPrivacyOptions(prev => 
              prev.map(option => 
                option.id === "search" ? { ...option, enabled } : option
              )
            )
          }
        },
        {
          id: "analytics",
          title: "Analytics Cookies",
          description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This data helps us improve our website performance and user experience. Currently not in use.",
          required: false,
          enabled: false,
          onToggle: () => {} // Analytics cookies are currently disabled
        },
        {
          id: "marketing",
          title: "Marketing Cookies",
          description: "These cookies are used to track visitors across websites to display relevant and engaging advertisements. They may be set by our advertising partners to build a profile of your interests. Currently not in use.",
          required: false,
          enabled: false,
          onToggle: () => {} // Marketing cookies are currently disabled
        }
      ])
    }
  }, [isOpen])

  const handleSavePreferences = () => {
    const preferences: PrivacyPreferences = {
      essential: privacyOptions.find(opt => opt.id === "essential")?.enabled || true,
      search: privacyOptions.find(opt => opt.id === "search")?.enabled || false,
      analytics: privacyOptions.find(opt => opt.id === "analytics")?.enabled || false,
      marketing: privacyOptions.find(opt => opt.id === "marketing")?.enabled || false,
    }
    
    savePrivacyPreferences(preferences)
    applyPrivacyPreferences(preferences)
    close()
  }

  const handleAcceptAll = () => {
    setPrivacyOptions(prev => 
      prev.map(option => ({ ...option, enabled: true }))
    )
  }

  const handleRejectAll = () => {
    setPrivacyOptions(prev => 
      prev.map(option => ({ ...option, enabled: option.required || false }))
    )
  }

  return (
    <Modal isOpen={isOpen} close={close} size="medium" panelClassName="max-h-[90vh] overflow-hidden">
      <Modal.Title>
        <div className="text-left pt-2 pb-4">
          <h1 className="text-2xl font-medium uppercase tracking-wide text-black">REVETIR</h1>
        </div>
      </Modal.Title>
      
      <div className="border-b border-gray-200 w-full mb-2"></div>
      
      <Modal.Body>
        <div className="w-full max-w-xl mx-auto overflow-y-auto max-h-[calc(90vh-200px)] text-sm px-2">
          {/* Introduction */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-6 mt-2">Your Privacy Choices</h2>
            <h2 className="text-lg font-semibold mb-4">SENSITIVE PERSONAL INFORMATION</h2>
            <p className="text-gray-600 mb-4">
              Revetir only uses and collects sensitive personal information for the purposes allowed by law or with your consent (collects only login details to enable account logins which are encrypted). Revetir does not collect or process sensitive personal information for the purpose of inferring characteristics about a consumer.
            </p>
            
            <h2 className="text-lg font-semibold mb-4">DO NOT SELL OR SHARE MY PERSONAL INFORMATION/YOUR OPT-OUT RIGHTS</h2>
            <p className="text-gray-600 mb-4">
              Revetir does not disclose your name, email address, phone number, address or any other personally identifiable information in exchange for money.
            </p>
            <p className="text-gray-600 mb-4">
              Like many companies, however, we use services that help deliver interest-based ads and targeted ads to you. When we use these services, we may disclose your personal information to advertising technology partners, who use this information to help us and other customers, to help display Revetir advertisements to you on non-Revetir websites. Under the California Consumer Privacy Act and various other laws, this type of sharing may be considered a 'sale' of personal information. Please review our <LocalizedClientLink href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</LocalizedClientLink> for a more detailed description of how we collect, use and share personal information in operating our business, and privacy rights you may have.
            </p>
            
            <h2 className="text-lg font-semibold mb-4">OPT-OUT PREFERENCE SIGNAL (GLOBAL PRIVACY CONTROL)</h2>
            <p className="text-gray-600 mb-4">
              You may use an Opt-Out Preference Signal, such as the Global Privacy Control (GPC), to opt-out of the sale/sharing of your personal information.
            </p>
            <p className="text-gray-600 mb-4">
              If you do not have a Revetir account or if you are not logged into your Revetir account, your request to opt-out of sale/sharing will be linked to your browser identifier only and not linked to any Revetir account information because the connection between your browser and your account will not be known to us. You can choose to opt-out by selecting the link "Your Privacy Choices" in the Preference Center in the following section.
            </p>
            <p className="text-gray-600 mb-6">
              If you have a Revetir account, and you want to opt-out of sharing your personal information such as email address and purchase history, please contact us via email at <a href="mailto:care@revetir.com" className="text-blue-600 hover:underline">care@revetir.com</a>.
            </p>
          </div>

          {/* Privacy Options */}
          <div className="mb-8">
            <div className="flex justify-start mb-4">
              <Button
                variant="secondary"
                onClick={handleAcceptAll}
                className="text-sm !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200"
              >
                Accept All
              </Button>
            </div>
            <h2 className="text-lg font-semibold mb-4">Manage consent preferences</h2>
            <div className="space-y-4">
            {privacyOptions.map((option) => (
              <CollapsibleSection
                key={option.id}
                title={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{option.title}</span>
                      {option.required && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {option.required ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 font-medium">
                          Always Active
                        </span>
                      ) : option.id === "analytics" || option.id === "marketing" ? (
                        <label className="relative inline-flex items-center cursor-not-allowed">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={false}
                            disabled={true}
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full opacity-50 cursor-not-allowed"></div>
                        </label>
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={option.enabled}
                            onChange={(e) => option.onToggle(e.target.checked)}
                            disabled={option.required}
                          />
                          <div className={clx(
                            "w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black",
                            {
                              "opacity-50 cursor-not-allowed": option.required
                            }
                          )}></div>
                        </label>
                      )}
                    </div>
                  </div>
                }
                isExpanded={option.id === "essential"} // Expand essential cookies by default
              >
                <div className="pt-4">
                  <p className="text-gray-600 text-sm leading-relaxed">{option.description}</p>
                </div>
              </CollapsibleSection>
            ))}
            </div>
          </div>

        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="w-full">
          <div className="border-t border-gray-200 w-full mb-4"></div>
          <div className="flex justify-end w-full">
            <Button
              onClick={handleSavePreferences}
              className="text-sm !rounded-none !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200"
            >
              Confirm my choices
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default PrivacyChoicesModal 
