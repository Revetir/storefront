"use client"

import React, { useState, useRef, useEffect } from "react"

const ExpoGrid = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasAutoPlayedRef = useRef(false)

  // Lazy load video - start playing when it enters viewport (only once)
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoPlayedRef.current) {
            videoElement.play()
            setIsPlaying(true)
            hasAutoPlayedRef.current = true
            observer.disconnect() // Stop observing after first autoplay
          }
        })
      },
      { threshold: 0.5 } // Start playing when 50% of video is visible
    )

    observer.observe(videoElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <section className="w-full pl-6 md:pl-12 lg:pl-24 py-16 md:py-24 bg-white">
      <div className="flex gap-24 justify-between items-center">
        {/* Left Column: Horizontal Video (70%) */}
        <div className="w-[60%]">
          <div className="relative w-full aspect-video border border-black mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onClick={handlePlayPause}
              loop
              muted
              playsInline
            >
              <source src="/images/beyond_space_revetir.mp4" type="video/mp4" />
            </video>

            {/* Video Controls - Bottom Right */}
            <div className="absolute bottom-0 right-0 translate-x-[calc(100%+0.75rem)] flex flex-col items-start gap-1">
              <button
                onClick={handlePlayPause}
                className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-start"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="4" width="3" height="12" fill="black"/>
                    <rect x="7" y="4" width="3" height="12" fill="black"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 4L11 10L0 16V4Z" fill="black"/>
                  </svg>
                )}
              </button>
              <button
                onClick={handleMuteToggle}
                className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-start"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6L0 9H-3V11H0L3 14V6Z" fill="black" transform="translate(3 0)"/>
                    <line x1="11" y1="7" x2="15" y2="13" stroke="black" strokeWidth="1.5"/>
                    <line x1="15" y1="7" x2="11" y2="13" stroke="black" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6L0 9H-3V11H0L3 14V6Z" fill="black" transform="translate(3 0)"/>
                    <path d="M10 7C11 8 11.5 9 11.5 10C11.5 11 11 12 10 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 5C13.5 6.5 14.5 8 14.5 10C14.5 12 13.5 13.5 12 15" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-left">
            <h3 className="text-lg font-light uppercase mb-2">BEYOND SPACE, A TENFOLD PRODUCTION</h3>
            <p className="text-gray-800 text-md">4 vignettes from 2 days across North America</p>
          </div>
        </div>

        {/* Right Column: Title + Two-Image Staggered Layout */}
        <div className="flex-1 relative">

           {/* Five-image grid layout */}
          <div className="relative w-full min-h-[600px]">
            {/* Image 1: Large landscape - top-left */}
            <div className="absolute top-0 left-0 w-[40%] aspect-square border border-black bg-transparent" />

            {/* Image 2: Small square - top-center-right */}
            <div className="absolute top-0 left-[43%] w-[18%] aspect-square border border-black bg-transparent" />

            {/* Image 3: Landscape - middle-center-right */}
            <div className="absolute top-[calc(18%+1rem)] left-[43%] w-[35%] aspect-[3/2] border border-black bg-transparent" />

            {/* Image 4: Small square - bottom-left */}
            <div className="absolute top-[calc(40%+1rem)] left-[22%] w-[18%] aspect-square border border-black bg-transparent" />

            {/* Image 5: Portrait - bottom-right */}
            <div className="absolute top-[calc(18%+1rem+35%*2/3+1rem)] left-[80%] w-[20%] aspect-[2/3] border border-black bg-transparent" />

            {/* Social Media Links - below Image 3 */}
            <div className="absolute top-[calc(18%+1rem+35%*2/3+1rem)] left-[43%] flex gap-4 items-center">
              {/* Instagram */}
              <a href="https://instagram.com/shoprevetir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" fill="currentColor"/>
                </svg>
                <span className="text-gray-800 text-md">@shoprevetir</span>
              </a>
            </div>
            <div className="absolute top-[calc(18%+1rem+35%*2/3+1rem+2.5rem)] left-[43%] flex gap-4 items-center">
              {/* TikTok */}
              <a href="https://tiktok.com/@shoprevetir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="currentColor"/>
                </svg>
                <span className="text-gray-800 text-md">@shoprevetir</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExpoGrid
