import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllAppSettings, updateAppSetting } from './appSettingsService';

/** Hook to read all app settings */
export function useAppSettings() {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: getAllAppSettings,
    staleTime: 5 * 60 * 1000,
  });
}

/** Hook to get a single setting with fallback */
export function useAppSetting(key: string, fallback: string = '') {
  const { data, isLoading } = useAppSettings();
  return {
    value: data?.[key] ?? fallback,
    isLoading,
  };
}

/** Hook to update a setting (master admin only) */
export function useUpdateAppSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateAppSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });
}
