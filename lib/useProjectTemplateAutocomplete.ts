"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface TemplatePlace {
  id?: number;
  placeName: string;
  distance: string | null;
  travelTime: string | null;
  sortOrder: number;
}

export interface ProjectTemplateOption {
  id: number;
  name: string;
  googleMap: string | null;
  places: TemplatePlace[];
}

/**
 * Convert a template's places to the format used by assetPlaces state
 * (matching the format in addnew/page.tsx and EditAssetClient.tsx)
 */
export function templatePlacesToAssetPlaces(
  places: TemplatePlace[]
): { id: string; type: "distance" | "time"; value: string; unit: string; placeName: string }[] {
  return places.map((p) => {
    let type: "distance" | "time" = "distance";
    let value = "";
    let unit = "km";
    if (p.distance) {
      type = "distance";
      const parts = p.distance.split(" ");
      value = parts[0] || "";
      unit = parts[1] || "km";
    } else if (p.travelTime) {
      type = "time";
      const parts = p.travelTime.split(" ");
      value = parts[0] || "";
      unit = parts[1] || "นาที";
    }
    return {
      id: `tpl-${p.id ?? Math.random()}`,
      type,
      value,
      unit,
      placeName: p.placeName,
    };
  });
}

interface UseProjectTemplateAutocompleteResult {
  filteredOptions: ProjectTemplateOption[];
  showDropdown: boolean;
  isLoading: boolean;
  selectTemplate: (template: ProjectTemplateOption) => void;
  handleNameInput: (value: string) => void;
  clearDropdown: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook for project name autocomplete with template auto-fill.
 *
 * Usage:
 *   const ac = useProjectTemplateAutocomplete(templates, (tpl) => {
 *     setFormData(prev => ({ ...prev, projectName: tpl.name, googleMap: tpl.googleMap || prev.googleMap }));
 *     setAssetPlaces(templatePlacesToAssetPlaces(tpl.places));
 *   });
 *
 *   // In your projectName input:
 *   onChange={e => ac.handleNameInput(e.target.value)}
 */
export function useProjectTemplateAutocomplete(
  templates: ProjectTemplateOption[],
  onSelect: (template: ProjectTemplateOption) => void
): UseProjectTemplateAutocompleteResult {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = query.trim().length === 0
    ? []
    : templates.filter((t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.name.includes(query)
      );

  const handleNameInput = useCallback((value: string) => {
    setQuery(value);
    setShowDropdown(value.trim().length > 0);
  }, []);

  const selectTemplate = useCallback(
    (template: ProjectTemplateOption) => {
      setQuery(template.name);
      setShowDropdown(false);
      onSelect(template);
    },
    [onSelect]
  );

  const clearDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return {
    filteredOptions,
    showDropdown,
    isLoading,
    selectTemplate,
    handleNameInput,
    clearDropdown,
    containerRef,
  };
}
