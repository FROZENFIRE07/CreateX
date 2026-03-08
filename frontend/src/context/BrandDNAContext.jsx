/**
 * Brand DNA Context
 * Global state for brand identity — persisted to localStorage.
 * Acts as the foundation of the entire platform.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BrandDNAContext = createContext(null);
const STORAGE_KEY = 'saco_brand_dna';

const DEFAULT_BRAND_DNA = {
    brandName: '',
    mission: '',
    vision: '',
    toneOfVoice: [],
    targetAudience: '',
    coreValues: [],
    typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
    },
    brandGuidelines: '',
    logoDataUrl: '',
    createdAt: null,
    updatedAt: null,
};

/** Check if a Brand DNA profile has been created (without needing the hook) */
export function hasBrandDNA() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        return !!(data && data.brandName && data.brandName.trim());
    } catch {
        return false;
    }
}

/** Get brand DNA from localStorage (static helper) */
export function getBrandDNA() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function BrandDNAProvider({ children }) {
    const [brandDNA, setBrandDNAState] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? { ...DEFAULT_BRAND_DNA, ...JSON.parse(raw) } : DEFAULT_BRAND_DNA;
        } catch {
            return DEFAULT_BRAND_DNA;
        }
    });

    const [isInitialized, setIsInitialized] = useState(() => hasBrandDNA());

    // Persist to localStorage whenever brandDNA changes
    useEffect(() => {
        if (brandDNA.brandName) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(brandDNA));
        }
    }, [brandDNA]);

    const setBrandDNA = useCallback((updates) => {
        setBrandDNAState((prev) => {
            const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
            next.updatedAt = new Date().toISOString();
            return next;
        });
    }, []);

    const initializeBrandDNA = useCallback((data) => {
        const now = new Date().toISOString();
        const full = {
            ...DEFAULT_BRAND_DNA,
            ...data,
            createdAt: now,
            updatedAt: now,
        };
        setBrandDNAState(full);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
        // Also keep the legacy username key for backward compat
        if (full.brandName) {
            localStorage.setItem('saco_username', full.brandName);
        }
        setIsInitialized(true);
    }, []);

    const resetBrandDNA = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setBrandDNAState(DEFAULT_BRAND_DNA);
        setIsInitialized(false);
    }, []);

    const value = {
        brandDNA,
        setBrandDNA,
        initializeBrandDNA,
        resetBrandDNA,
        isInitialized,
    };

    return (
        <BrandDNAContext.Provider value={value}>
            {children}
        </BrandDNAContext.Provider>
    );
}

export function useBrandDNA() {
    const context = useContext(BrandDNAContext);
    if (!context) {
        throw new Error('useBrandDNA must be used within BrandDNAProvider');
    }
    return context;
}

export default BrandDNAContext;
