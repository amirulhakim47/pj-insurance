'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InsuranceFormData, InsurancePolicy, NavigationState } from '@/types';

export function useInsuranceFlow() {
  const router = useRouter();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentStep: 'form',
  });

  // Load state from sessionStorage on mount
  useEffect(() => {
    const formData = getStoredFormData();
    const selectedPolicy = getStoredSelectedPolicy();
    
    setNavigationState(prev => ({
      ...prev,
      formData: formData || undefined,
      selectedPolicy: selectedPolicy || undefined,
    }));
  }, []);

  const getStoredFormData = (): InsuranceFormData | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = sessionStorage.getItem('insuranceFormData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const getStoredSelectedPolicy = (): InsurancePolicy | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = sessionStorage.getItem('selectedPolicy');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const storeFormData = (data: InsuranceFormData) => {
    if (typeof window === 'undefined') return;
    
    sessionStorage.setItem('insuranceFormData', JSON.stringify(data));
    setNavigationState(prev => ({
      ...prev,
      formData: data,
    }));
  };

  const storeSelectedPolicy = (policy: InsurancePolicy) => {
    if (typeof window === 'undefined') return;
    
    sessionStorage.setItem('selectedPolicy', JSON.stringify(policy));
    setNavigationState(prev => ({
      ...prev,
      selectedPolicy: policy,
    }));
  };

  const clearStoredData = () => {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem('insuranceFormData');
    sessionStorage.removeItem('selectedPolicy');
    setNavigationState({
      currentStep: 'form',
    });
  };

  const navigateToStep = (step: NavigationState['currentStep']) => {
    setNavigationState(prev => ({
      ...prev,
      currentStep: step,
    }));

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
  };

  const submitForm = async (data: InsuranceFormData) => {
    storeFormData(data);
    navigateToStep('loading');
  };

  const selectPolicy = (policy: InsurancePolicy) => {
    storeSelectedPolicy(policy);
    navigateToStep('payment');
  };

  const restartFlow = () => {
    clearStoredData();
    navigateToStep('form');
  };

  return {
    navigationState,
    getStoredFormData,
    getStoredSelectedPolicy,
    storeFormData,
    storeSelectedPolicy,
    clearStoredData,
    navigateToStep,
    submitForm,
    selectPolicy,
    restartFlow,
  };
}

// Hook for checking if user can access a specific page
export function usePageAccess(requiredStep: NavigationState['currentStep']) {
  const router = useRouter();
  const { getStoredFormData, getStoredSelectedPolicy } = useInsuranceFlow();

  useEffect(() => {
    const formData = getStoredFormData();
    const selectedPolicy = getStoredSelectedPolicy();

    // Define access rules
    const accessRules = {
      form: true, // Always accessible
      loading: !!formData, // Requires form data
      results: !!formData, // Requires form data
      payment: !!formData && !!selectedPolicy, // Requires form data and selected policy
      confirmation: !!formData && !!selectedPolicy, // Requires form data and selected policy
    };

    if (!accessRules[requiredStep]) {
      router.push('/');
    }
  }, [requiredStep, router, getStoredFormData, getStoredSelectedPolicy]);
}

// Hook for progress tracking
export function useProgressTracking() {
  const [progress, setProgress] = useState(0);

  const startProgress = (duration: number = 5000) => {
    setProgress(0);
    const interval = 50; // Update every 50ms
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
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
