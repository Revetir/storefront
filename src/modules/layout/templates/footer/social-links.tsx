"use client"

import { trackSocialClick } from "@lib/util/analytics"

export default function SocialLinks() {
  return (
    <>
      <a
        href="https://instagram.com/youcouldbewearingthis"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-ui-fg-base"
        onClick={() => trackSocialClick({ platform: 'instagram' })}
      >
        Instagram
      </a>
      <a
        href="https://tiktok.com/@youcouldbewearingthis"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-ui-fg-base"
        onClick={() => trackSocialClick({ platform: 'tiktok' })}
      >
        TikTok
      </a>
    </>
  )
}
