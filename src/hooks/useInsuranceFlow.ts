'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { InsuranceFormData, InsurancePolicy, NavigationState } from '@/types';
import type {
  VehicleDetailsResponse,
  NvicItem,
  QuotationResponse,
  CheckUBBResponse,
  TransactionType,
} from '@/types/allianz';

const STORAGE_KEYS = {
  formData: 'insuranceFormData',
  selectedPolicy: 'selectedPolicy',
  vehicleDetails: 'allianz_vehicleDetails',
  selectedNvic: 'allianz_selectedNvic',
  quotation: 'allianz_quotation',
  selectedAddons: 'allianz_selectedAddons',
  ubbResult: 'allianz_ubbResult',
  transactionType: 'allianz_transactionType',
  customerDetails: 'allianz_customerDetails',
  marketingConsent: 'allianz_marketingConsent',
  noOfClaims: 'allianz_noOfClaims',
} as const;

function safeGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key);
}

export function useInsuranceFlow() {
  const router = useRouter();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentStep: 'form',
  });

  useEffect(() => {
    const formData = safeGet<InsuranceFormData>(STORAGE_KEYS.formData);
    const selectedPolicy = safeGet<InsurancePolicy>(STORAGE_KEYS.selectedPolicy);

    setNavigationState((prev) => ({
      ...prev,
      formData: formData || undefined,
      selectedPolicy: selectedPolicy || undefined,
    }));
  }, []);

  // ── Form data ──

  const getStoredFormData = useCallback(
    () => safeGet<InsuranceFormData>(STORAGE_KEYS.formData),
    [],
  );

  const storeFormData = useCallback(
    (data: InsuranceFormData) => {
      safeSet(STORAGE_KEYS.formData, data);
      setNavigationState((prev) => ({ ...prev, formData: data }));
    },
    [],
  );

  // ── Selected policy ──

  const getStoredSelectedPolicy = useCallback(
    () => safeGet<InsurancePolicy>(STORAGE_KEYS.selectedPolicy),
    [],
  );

  const storeSelectedPolicy = useCallback(
    (policy: InsurancePolicy) => {
      safeSet(STORAGE_KEYS.selectedPolicy, policy);
      setNavigationState((prev) => ({ ...prev, selectedPolicy: policy }));
    },
    [],
  );

  // ── Allianz vehicle details ──

  const getVehicleDetails = useCallback(
    () => safeGet<VehicleDetailsResponse>(STORAGE_KEYS.vehicleDetails),
    [],
  );

  const storeVehicleDetails = useCallback(
    (data: VehicleDetailsResponse) => safeSet(STORAGE_KEYS.vehicleDetails, data),
    [],
  );

  // ── Selected NVIC variant ──

  const getSelectedNvic = useCallback(
    () => safeGet<NvicItem>(STORAGE_KEYS.selectedNvic),
    [],
  );

  const storeSelectedNvic = useCallback(
    (nvic: NvicItem) => safeSet(STORAGE_KEYS.selectedNvic, nvic),
    [],
  );

  // ── Quotation ──

  const getQuotation = useCallback(
    () => safeGet<QuotationResponse>(STORAGE_KEYS.quotation),
    [],
  );

  const storeQuotation = useCallback(
    (data: QuotationResponse) => safeSet(STORAGE_KEYS.quotation, data),
    [],
  );

  // ── UBB Result ──

  const getUBBResult = useCallback(
    () => safeGet<CheckUBBResponse>(STORAGE_KEYS.ubbResult),
    [],
  );

  const storeUBBResult = useCallback(
    (data: CheckUBBResponse) => safeSet(STORAGE_KEYS.ubbResult, data),
    [],
  );

  // ── Transaction Type ──

  const getTransactionType = useCallback(
    (): TransactionType => safeGet<TransactionType>(STORAGE_KEYS.transactionType) || 'NWOO',
    [],
  );

  const storeTransactionType = useCallback(
    (type: TransactionType) => safeSet(STORAGE_KEYS.transactionType, type),
    [],
  );

  // ── Clear all ──

  const clearStoredData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(safeRemove);
    setNavigationState({ currentStep: 'form' });
  }, []);

  // ── Navigation ──

  const navigateToStep = useCallback(
    (step: NavigationState['currentStep']) => {
      setNavigationState((prev) => ({ ...prev, currentStep: step }));
      switch (step) {
        case 'form':
          router.push('/');
          break;
        case 'loading':
          router.push('/loading');
          break;
        case 'results':
          router.push('/results');
          break;
        case 'payment':
          router.push('/payment');
          break;
        case 'confirmation':
          router.push('/thank-you');
          break;
      }
    },
    [router],
  );

  const submitForm = useCallback(
    async (data: InsuranceFormData) => {
      storeFormData(data);
      navigateToStep('loading');
    },
    [storeFormData, navigateToStep],
  );

  const selectPolicy = useCallback(
    (policy: InsurancePolicy) => {
      storeSelectedPolicy(policy);
      navigateToStep('payment');
    },
    [storeSelectedPolicy, navigateToStep],
  );

  const restartFlow = useCallback(() => {
    clearStoredData();
    navigateToStep('form');
  }, [clearStoredData, navigateToStep]);

  return {
    navigationState,
    // Form / policy
    getStoredFormData,
    getStoredSelectedPolicy,
    storeFormData,
    storeSelectedPolicy,
    // Allianz-specific
    getVehicleDetails,
    storeVehicleDetails,
    getSelectedNvic,
    storeSelectedNvic,
    getQuotation,
    storeQuotation,
    getUBBResult,
    storeUBBResult,
    getTransactionType,
    storeTransactionType,
    // Navigation
    clearStoredData,
    navigateToStep,
    submitForm,
    selectPolicy,
    restartFlow,
  };
}

export function usePageAccess(requiredStep: NavigationState['currentStep']) {
  const router = useRouter();
  const { getStoredFormData, getStoredSelectedPolicy } = useInsuranceFlow();

  useEffect(() => {
    const formData = getStoredFormData();
    const selectedPolicy = getStoredSelectedPolicy();

    const accessRules = {
      form: true,
      loading: !!formData,
      results: !!formData,
      payment: !!formData && !!selectedPolicy,
      confirmation: !!formData && !!selectedPolicy,
    };

    if (!accessRules[requiredStep]) {
      router.push('/');
    }
  }, [requiredStep, router, getStoredFormData, getStoredSelectedPolicy]);
}

export function useProgressTracking() {
  const [progress, setProgress] = useState(0);

  const startProgress = (duration: number = 5000) => {
    setProgress(0);
    const interval = 50;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  };

  return { progress, startProgress };
}
