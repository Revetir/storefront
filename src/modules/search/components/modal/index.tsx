"use client"

import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import { Hits, InstantSearch, Configure, Index, useSearchBox, useHits } from "react-instantsearch"
import { getSearchClient } from "@lib/util/search-privacy"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Search from "@modules/common/icons/search"
import { getProductUrl } from "@lib/util/brand-utils"

// Helper for click outside
function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function listener(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
}

interface SearchModalProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function SearchModal({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen }: SearchModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalSetIsOpen || setInternalIsOpen
  const pathname = usePathname()
  const [gender, setGender] = useState<"menswear" | "womenswear">("menswear");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [isOpen])

  // Position the dropdown below the button (fixed, so it stays on scroll)
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768; // md breakpoint
      
      let left = rect.left;
      let width = 400;
      let top = rect.bottom;
      
      if (isMobile) {
        // On mobile, center the modal horizontally on the page regardless of button position
        width = Math.min(window.innerWidth - 32, 400); // Full width minus margins, max 400px
        left = (window.innerWidth - width) / 2; // Center horizontally on the page
        
        // Position vertically with some space from the top
        top = Math.max(16, Math.min(rect.bottom + 8, window.innerHeight - 200)); // 8px below button, but ensure it doesn't go too low
      }
      
      setDropdownStyle({
        position: "fixed",
        top: top,
        left: left,
        width: width,
        zIndex: 1000,
      });
    }
  }, [isOpen]);

  // Close on click outside
  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(true)}
        type="button"
        className="hover:text-black hover:underline bg-transparent p-0 m-0 border-0 outline-none cursor-pointer"
      >
        {/* Mobile: Show icon */}
        <div className="md:hidden p-2 hover:opacity-70 transition-opacity">
          <Search className="w-5 h-5 text-black" />
        </div>

        {/* Desktop: Show text */}
        <div className="hidden md:block text-xs uppercase text-gray-700">
          Search
        </div>
      </button>
      {isOpen && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-black !rounded-none !shadow-none p-0 pb-2 flex flex-col justify-between max-h-[80vh] overflow-hidden" // flex column for vertical centering, max height for mobile
        >
          <InstantSearch
            key={gender}
            searchClient={getSearchClient()}
            indexName={process.env.NEXT_PUBLIC_ALGOLIA_PRODUCT_INDEX_NAME}
          >
            {/* Gender buttons row, with top padding for vertical centering */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "16px 16px 0 16px" }} className="md:px-8 md:pt-8">
              <button
                onClick={() => setGender("menswear")}
                type="button"
                className={`uppercase text-xs font-sans text-gray-700 hover:text-black hover:underline bg-transparent border-0 cursor-pointer ${gender === "menswear" ? "font-bold underline" : "font-normal"}`}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                }}
              >
                MENSWEAR
              </button>
              <button
                onClick={() => setGender("womenswear")}
                type="button"
                className={`uppercase text-xs font-sans text-gray-700 hover:text-black hover:underline bg-transparent border-0 cursor-pointer ${gender === "womenswear" ? "font-bold underline" : "font-normal"}`}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                }}
              >
                WOMENSWEAR
              </button>
            </div>
            <Configure facetFilters={[`gender:${gender}`]} filters="status:published" hitsPerPage={8} />
            {/* Move the search bar lower by increasing the space above it by 50% (relative to previous) */}
            <div className="flex-1 flex flex-col" style={{ justifyContent: "flex-start" }}>
              {/* Add extra margin above the search bar (was ~auto, now 48px) */}
              <div style={{ marginTop: "15px" }}>
                <CustomSearchBox inputRef={searchInputRef} onClose={() => setIsOpen(false)} gender={gender} />
              </div>
            </div>
            {/* Results area, with horizontal padding to match modal sides */}
            <ResultsContainer gender={gender} />
          </InstantSearch>
        </div>,
        document.body
      )}
    </>
  );
}

// Custom SearchBox with ref, sharp, rectangular outline, and Close button
function CustomSearchBox({ inputRef, onClose, gender }: { inputRef: React.RefObject<HTMLInputElement | null>, onClose: () => void, gender: "menswear" | "womenswear" }) {
  const { query, refine } = useSearchBox();
  // Placeholder text based on gender
  const placeholder = gender === "menswear" ? "SEARCH MENSWEAR" : "SEARCH WOMENSWEAR";
  return (
    <form
      className="w-full flex items-center px-4 md:px-8" // responsive padding
      onSubmit={e => { e.preventDefault(); }}
      autoComplete="off"
      style={{ minHeight: 56 }} // ensure a minimum height for vertical centering
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => refine(e.currentTarget.value)}
        className="w-full px-3 py-2 border border-gray-300 outline-none focus:border-gray-500 transition-all bg-white text-black placeholder-gray-400 !rounded-none !shadow-none uppercase text-xs font-sans"
        placeholder={placeholder}
        style={{ 
          boxShadow: "none",
          fontSize: "16px" // Prevents iOS zoom on focus
        }}
        autoFocus
      />
      {/* Close button, right-aligned, vertically centered, more space, uppercase, black, nav font */}
      <button
        type="button"
        onClick={onClose}
        className="ml-6 text-black hover:text-black text-xs font-sans uppercase bg-none border-none p-0 cursor-pointer"
        style={{ background: "none", border: "none", textTransform: "uppercase", fontFamily: 'inherit', fontSize: '0.75rem', letterSpacing: '0.05em', paddingRight: 16 }}
        tabIndex={0}
      >
        CLOSE
      </button>
    </form>
  );
}

const ProductHit = ({ hit }: { hit: any }) => {
  const handleProductClick = () => {
    // Blur any focused input to prevent mobile zoom issues
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    // Force viewport reset on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // Small delay to ensure the blur happens before navigation
      setTimeout(() => {
        // Force viewport to reset zoom level
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
      }, 100);
    }
  };

  return (
    <div className="flex flex-row gap-x-2 mt-4 relative">
      <img
        src={hit.thumbnail}
        alt={`${hit.type || 'Product'} ${hit.title}`}
        width={60}
        height={60}
        style={{ objectFit: 'contain', objectPosition: 'center', borderRadius: 4 }}
        loading="lazy"
      />
      <div className="flex flex-col gap-y-1">
        {hit.brands?.[0]?.name && (
          <span className="text-xs text-gray-500 uppercase tracking-wide">{hit.brands[0].name}</span>
        )}
        <h3>{hit.title}</h3>
        {/* <p className="text-sm text-gray-500">{hit.description}</p> */}
      </div>
      <Link
        href={getProductUrl(hit.brands, hit.handle || '')}
        className="absolute right-0 top-0 w-full h-full"
        aria-label={`View Product: ${hit.title}`}
        onClick={handleProductClick}
      />
    </div>
  )
}

const BrandHit = ({ hit, gender }: { hit: any, gender: "menswear" | "womenswear" }) => {
  const handleBrandClick = () => {
    // Blur any focused input to prevent mobile zoom issues
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    // Force viewport reset on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // Small delay to ensure the blur happens before navigation
      setTimeout(() => {
        // Force viewport to reset zoom level
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
      }, 100);
    }
  };

  const genderPath = gender === "menswear" ? "men" : "women";

  return (
    <div className="mt-4">
      <Link 
        href={`/${genderPath}/brands/${hit.slug}`}
        className="text-black hover:text-gray-600 text-sm font-sans uppercase tracking-wide transition-colors"
        aria-label={`View Brand: ${hit.name}`}
        onClick={handleBrandClick}
      >
        {hit.name}
      </Link>
    </div>
  )
}


// Component to conditionally show products section only if there are product results
function ProductSection() {
  const { hits } = useHits();

  if (hits.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wide mb-3">PRODUCTS</h4>
      <Hits hitComponent={ProductHit} />
    </div>
  );
}

// Wrapper component that only renders the results container when there's a query
function ResultsContainer({ gender }: { gender: "menswear" | "womenswear" }) {
  const { query } = useSearchBox();

  // Don't render the container at all if there's no query
  if (!query.trim()) return null;

  return (
    <div className="max-h-96 overflow-y-auto px-4 pb-4 md:px-8" style={{ marginTop: "16px" }}>
      <SearchResults gender={gender} />
    </div>
  );
}

function SearchResults({ gender }: { gender: "menswear" | "womenswear" }) {
  const { query } = useSearchBox();
  const { hits: productHits } = useHits();
  const [brandHits, setBrandHits] = useState<any[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);

  // Search brands when query changes
  useEffect(() => {
    if (!query.trim()) {
      setBrandHits([]);
      return;
    }

    const searchBrands = async () => {
      setIsLoadingBrands(true);
      try {
        const searchClient = getSearchClient();
        const response = await searchClient.search([{
          indexName: process.env.NEXT_PUBLIC_ALGOLIA_BRAND_INDEX_NAME || 'brands',
          query: query,
          params: {
            hitsPerPage: 3,
          }
        }]);

        setBrandHits(response.results[0]?.hits || []);
      } catch (error) {
        console.error('Error searching brands:', error);
        setBrandHits([]);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    searchBrands();
  }, [query]);

  if (!query.trim()) return null;

  // Only render the container with padding if there are results to show
  const hasResults = brandHits.length > 0 || productHits.length > 0;

  if (!hasResults) return null;

  return (
    <div className="space-y-6">
      {/* Brands Section - only shows if there are brand results */}
      {brandHits.length > 0 && (
        <div>
          <h4 className="text-xs uppercase text-gray-500 font-bold tracking-wide mb-3">BRANDS</h4>
          {brandHits.map((hit) => (
            <BrandHit key={hit.objectID} hit={hit} gender={gender} />
          ))}
        </div>
      )}

      {/* Products Section - only shows if there are product results */}
      <ProductSection />
    </div>
  );
}
