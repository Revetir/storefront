"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"

const ExpoGrid = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasAutoPlayedRef = useRef(false)
  const autoPlayRequestedRef = useRef(false)
  const userInteractedRef = useRef(false)

  // Lazy load video and auto-play when it enters the viewport
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true)

            if (!hasAutoPlayedRef.current && !userInteractedRef.current) {
              autoPlayRequestedRef.current = true
            }
          } else if (!userInteractedRef.current && !videoElement.paused) {
            videoElement.pause()
            setIsPlaying(false)
          }
        })
      },
      {
        rootMargin: "200px",
        threshold: 0.35,
      }
    )

    observer.observe(videoElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Sync React state with native video events (for fullscreen controls sync)
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVolumeChange = () => setIsMuted(videoElement.muted)

    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    videoElement.addEventListener('volumechange', handleVolumeChange)

    return () => {
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
      videoElement.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !shouldLoadVideo) return

    videoElement.load()

    if (!autoPlayRequestedRef.current || hasAutoPlayedRef.current || userInteractedRef.current) {
      return
    }

    const attemptPlay = () => {
      const playPromise = videoElement.play()
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            hasAutoPlayedRef.current = true
          })
          .catch(() => {
            // Autoplay can fail silently on some devices/browsers.
          })
      } else {
        hasAutoPlayedRef.current = true
      }
    }

    if (videoElement.readyState >= 2) {
      attemptPlay()
      return
    }

    const handleCanPlay = () => {
      attemptPlay()
      videoElement.removeEventListener("canplay", handleCanPlay)
    }

    videoElement.addEventListener("canplay", handleCanPlay)
    return () => videoElement.removeEventListener("canplay", handleCanPlay)
  }, [shouldLoadVideo])

  const handlePlayPause = () => {
    userInteractedRef.current = true
    if (videoRef.current) {
      if (!shouldLoadVideo) {
        setShouldLoadVideo(true)
      }
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        return
      }

      const attemptPlay = () => {
        const playPromise = videoRef.current?.play()
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            // Ignore play errors (e.g. user gesture requirements).
          })
        }
      }

      if (videoRef.current.readyState >= 2) {
        attemptPlay()
      } else {
        const handleCanPlay = () => {
          attemptPlay()
          videoRef.current?.removeEventListener("canplay", handleCanPlay)
        }
        videoRef.current.addEventListener("canplay", handleCanPlay)
      }
    }
  }

  const handleMuteToggle = () => {
    userInteractedRef.current = true
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleFullscreen = () => {
    userInteractedRef.current = true
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        const video = videoRef.current
        video.requestFullscreen().then(() => {
          // Set white background when entering fullscreen
          if (document.fullscreenElement) {
            (document.fullscreenElement as HTMLElement).style.backgroundColor = 'white'
          }
        }).catch(err => {
          console.error('Error attempting to enable fullscreen:', err)
        })
      }
    }
  }

  return (
    <section className="w-full px-4 sm:px-6 md:px-12 lg:px-24 py-12 md:py-24 bg-white">
      {/* Desktop: side-by-side | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-10 xl:gap-14">
        
        {/* Left Column: Video */}
        <div className="w-full lg:w-[44%] xl:w-[46%]">
          <div className="relative w-full aspect-video mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onClick={handlePlayPause}
              loop
              muted={isMuted}
              playsInline
              preload="none"
            >
              {shouldLoadVideo ? (
                <source src="/images/beyond_space_revetir.mp4" type="video/mp4" />
              ) : null}
            </video>

            {/* Video Controls - positioned inside on mobile, outside on desktop */}
            {/* Left side controls (mobile only) */}
            <div className="absolute bottom-3 left-3 lg:hidden flex flex-row items-center gap-1">
              <button
                onClick={handlePlayPause}
                className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-center bg-transparent rounded text-white"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="4" width="3" height="12" fill="currentColor"/>
                    <rect x="7" y="4" width="3" height="12" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 4L11 10L0 16V4Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
              <button
                onClick={handleMuteToggle}
                className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-center bg-transparent rounded text-white"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6L0 9H-3V11H0L3 14V6Z" fill="currentColor" transform="translate(3 0)"/>
                    <line x1="11" y1="7" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="15" y1="7" x2="11" y2="13" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6L0 9H-3V11H0L3 14V6Z" fill="currentColor" transform="translate(3 0)"/>
                    <path d="M10 7C11 8 11.5 9 11.5 10C11.5 11 11 12 10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 5C13.5 6.5 14.5 8 14.5 10C14.5 12 13.5 13.5 12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Right side fullscreen button (mobile only) */}
            <div className="absolute bottom-3 right-3 lg:hidden">
              <button
                onClick={handleFullscreen}
                className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-center bg-transparent rounded text-white"
                aria-label="Fullscreen"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2L6 2L6 4L4 4L4 6L2 6L2 2Z" fill="currentColor"/>
                  <path d="M18 2L14 2L14 4L16 4L16 6L18 6L18 2Z" fill="currentColor"/>
                  <path d="M2 18L6 18L6 16L4 16L4 14L2 14L2 18Z" fill="currentColor"/>
                  <path d="M18 18L14 18L14 16L16 16L16 14L18 14L18 18Z" fill="currentColor"/>
                </svg>
              </button>
            </div>

            {/* Desktop controls (outside video) */}
            <div className="absolute bottom-0 right-0 lg:translate-x-[calc(100%+0.75rem)] hidden lg:flex flex-col items-start gap-1">
              <button
                onClick={handlePlayPause}
                className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-start bg-transparent p-0 rounded text-black"
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="4" width="3" height="12" fill="currentColor"/>
                    <rect x="7" y="4" width="3" height="12" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 4L11 10L0 16V4Z" fill="currentColor"/>
                  </svg>
                )}
              </button>
              <button
                onClick={handleMuteToggle}
                className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-start bg-transparent p-0 rounded text-black"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6L0 9H-3V11H0L3 14V6Z" fill="currentColor" transform="translate(3 0)"/>
                    <line x1="11" y1="7" x2="15" y2="13" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="15" y1="7" x2="11" y2="13" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6L0 9H-3V11H0L3 14V6Z" fill="currentColor" transform="translate(3 0)"/>
                    <path d="M10 7C11 8 11.5 9 11.5 10C11.5 11 11 12 10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M12 5C13.5 6.5 14.5 8 14.5 10C14.5 12 13.5 13.5 12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="text-left">
            <h3 className="text-base md:text-lg font-light uppercase mb-2">BEYOND SPACE, A TENFOLD PRODUCTION</h3>
            <p className="text-gray-800 text-sm md:text-base">4 vignettes from 2 days across North America</p>
          </div>
        </div>

        {/* Right Column: Asymmetric Mosaic Grid */}
        <div className="w-full lg:flex-1">
          {/* 
            Mobile: 4 columns × 3 rows (simpler layout)
            Desktop: 6 columns × 4 rows (full asymmetric mosaic)
          */}
          
          {/* Mobile Grid (< lg) */}
          <div className="grid gap-3 lg:hidden" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {/* Row 1: Image 1 (2 cols) + Image 2 (1 col) + Image 3 partial (1 col) */}
            <div className="col-span-2 row-span-2 border border-black overflow-hidden">
              <div className="relative w-full aspect-square">
                <Image
                  src="/images/revetir_pretentiousness_scale.jpg"
                  alt="Revetir Pretentiousness Scale"
                  fill
                  className="object-contain"
                  sizes="50vw"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="col-span-1 border border-black overflow-hidden">
              <div className="relative w-full aspect-square">
                <Image
                  src="/images/popular_brands_2025_cover.jpg"
                  alt="Popular Brands 2025 Cover"
                  fill
                  className="object-contain"
                  sizes="25vw"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="col-span-1 row-span-2 border border-black overflow-hidden">
              <div className="relative w-full h-full min-h-[140px]">
                <Image
                  src="/images/marketing_team_on_vacation.jpg"
                  alt="Marketing Team on Vacation"
                  fill
                  className="object-contain"
                  sizes="25vw"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="col-span-1 border border-black overflow-hidden">
              <div className="relative w-full aspect-square">
                <Image
                  src="/images/not_arguing_with_acne_studios.png"
                  alt="Not Arguing with Acne Studios"
                  fill
                  className="object-contain"
                  sizes="25vw"
                  loading="lazy"
                />
              </div>
            </div>
            {/* Row 3: Social links + Image 5 */}
            <div className="col-span-2 flex flex-col items-center justify-center gap-2 py-2 text-center">
              <a href="https://instagram.com/shoprevetir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" fill="currentColor"/>
                </svg>
                <span className="text-gray-800 text-sm">@shoprevetir</span>
              </a>
              <a href="https://tiktok.com/@shoprevetir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="currentColor"/>
                </svg>
                <span className="text-gray-800 text-sm">@shoprevetir</span>
              </a>
            </div>
            <div className="col-span-2 border border-black overflow-hidden">
              <div className="relative w-full aspect-[3/2]">
                <Image
                  src="/images/maslows_hierarchy_rick_owens.jpg"
                  alt="Maslow's Hierarchy Rick Owens"
                  fill
                  className="object-contain"
                  sizes="50vw"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Desktop Grid (>= lg) - Moodboard aesthetic with unique sizes */}
          <div 
            className="hidden lg:grid gap-2"
            style={{
              gridTemplateColumns: 'repeat(14, 1fr)',
              gridTemplateRows: 'repeat(7, 80px)',
            }}
          >
            {/* Image 1: Large block (dominant) - top left */}
            <div 
              className="border border-black overflow-hidden"
              style={{ gridColumn: '1 / 8', gridRow: '1 / 5' }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/revetir_pretentiousness_scale.jpg"
                  alt="Revetir Pretentiousness Scale"
                  fill
                  className="object-contain"
                  sizes="42vw"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Image 3: Large landscape - top right */}
            <div 
              className="border border-black overflow-hidden"
              style={{ gridColumn: '8 / 15', gridRow: '1 / 5' }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/marketing_team_on_vacation.jpg"
                  alt="Marketing Team on Vacation"
                  fill
                  className="object-contain"
                  sizes="45vw"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Image 2: Small horizontal strip - bottom left */}
            <div 
              className="border border-black overflow-hidden"
              style={{ gridColumn: '1 / 6', gridRow: '5 / 6' }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/popular_brands_2025_cover.jpg"
                  alt="Popular Brands 2025 Cover"
                  fill
                  className="object-contain"
                  sizes="24vw"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Image 4: Small vertical strip - center-bottom */}
            <div 
              className="border border-black overflow-hidden"
              style={{ gridColumn: '6 / 8', gridRow: '5 / 8' }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/not_arguing_with_acne_studios.png"
                  alt="Not Arguing with Acne Studios"
                  fill
                  className="object-contain"
                  sizes="14vw"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Image 5: Large wide block - bottom right */}
            <div 
              className="border border-black overflow-hidden"
              style={{ gridColumn: '8 / 15', gridRow: '5 / 8' }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="/images/maslows_hierarchy_rick_owens.jpg"
                  alt="Maslow's Hierarchy Rick Owens"
                  fill
                  className="object-contain"
                  sizes="20vw"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Social Links - bottom left, compact */}
            <div 
              className="flex flex-col items-center justify-center gap-2 pb-2 text-center"
              style={{ gridColumn: '1 / 6', gridRow: '6 / 8' }}
            >
              <a href="https://instagram.com/shoprevetir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C14.717 2 15.056 2.01 16.122 2.06C17.187 2.11 17.912 2.277 18.55 2.525C19.21 2.779 19.766 3.123 20.322 3.678C20.8305 4.1779 21.224 4.78259 21.475 5.45C21.722 6.087 21.89 6.813 21.94 7.878C21.987 8.944 22 9.283 22 12C22 14.717 21.99 15.056 21.94 16.122C21.89 17.187 21.722 17.912 21.475 18.55C21.2247 19.2178 20.8311 19.8226 20.322 20.322C19.822 20.8303 19.2173 21.2238 18.55 21.475C17.913 21.722 17.187 21.89 16.122 21.94C15.056 21.987 14.717 22 12 22C9.283 22 8.944 21.99 7.878 21.94C6.813 21.89 6.088 21.722 5.45 21.475C4.78233 21.2245 4.17753 20.8309 3.678 20.322C3.16941 19.8222 2.77593 19.2175 2.525 18.55C2.277 17.913 2.11 17.187 2.06 16.122C2.013 15.056 2 14.717 2 12C2 9.283 2.01 8.944 2.06 7.878C2.11 6.812 2.277 6.088 2.525 5.45C2.77524 4.78218 3.1688 4.17732 3.678 3.678C4.17767 3.16923 4.78243 2.77573 5.45 2.525C6.088 2.277 6.812 2.11 7.878 2.06C8.944 2.013 9.283 2 12 2ZM12 7C10.6739 7 9.40215 7.52678 8.46447 8.46447C7.52678 9.40215 7 10.6739 7 12C7 13.3261 7.52678 14.5979 8.46447 15.5355C9.40215 16.4732 10.6739 17 12 17C13.3261 17 14.5979 16.4732 15.5355 15.5355C16.4732 14.5979 17 13.3261 17 12C17 10.6739 16.4732 9.40215 15.5355 8.46447C14.5979 7.52678 13.3261 7 12 7ZM18.5 6.75C18.5 6.41848 18.3683 6.10054 18.1339 5.86612C17.8995 5.6317 17.5815 5.5 17.25 5.5C16.9185 5.5 16.6005 5.6317 16.3661 5.86612C16.1317 6.10054 16 6.41848 16 6.75C16 7.08152 16.1317 7.39946 16.3661 7.63388C16.6005 7.8683 16.9185 8 17.25 8C17.5815 8 17.8995 7.8683 18.1339 7.63388C18.3683 7.39946 18.5 7.08152 18.5 6.75ZM12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9Z" fill="currentColor"/>
                </svg>
                <span className="text-gray-800 text-base">@shoprevetir</span>
              </a>
              <a href="https://tiktok.com/@shoprevetir" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="currentColor"/>
                </svg>
                <span className="text-gray-800 text-base">@shoprevetir</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExpoGrid
