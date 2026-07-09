import { useState, useCallback, useEffect } from "react";
import { postCode } from "@/lib/postcode";

export interface PostcodeFormFields {
  zipCode: string;
  province: string;
  district: string;
  subdistrict: string;
}

interface UsePostcodeLookupResult {
  // Derived dropdown options
  provinceOptions: string[];
  districtOptions: string[];
  subdistrictOptions: string[];
  // Whether the zipCode has any matches
  hasMatches: boolean;
  // Handler to call when zipCode input changes
  handleZipCodeChange: (zip: string) => Partial<PostcodeFormFields>;
  // Handler to call when province dropdown changes
  handleProvinceChange: (province: string) => Partial<PostcodeFormFields>;
  // Handler to call when district dropdown changes
  handleDistrictChange: (district: string) => Partial<PostcodeFormFields>;
}

/**
 * Hook that derives dropdown options for province / district / subdistrict
 * based on the current postcode form field values.
 *
 * Usage:
 *   const lookup = usePostcodeLookup(formData);
 *   // In your zipCode onChange:
 *   const patch = lookup.handleZipCodeChange(newZip);
 *   setFormData(prev => ({ ...prev, zipCode: newZip, ...patch }));
 */
export function usePostcodeLookup(fields: PostcodeFormFields): UsePostcodeLookupResult {
  const { zipCode, province, district } = fields;

  // Records matching the current zipCode
  const matchesByZip = zipCode.length === 5
    ? postCode.filter(r => r.postcode === zipCode)
    : [];

  const hasMatches = matchesByZip.length > 0;

  // Unique provinces for this zipCode
  const provinceOptions: string[] = hasMatches
    ? Array.from(new Set(matchesByZip.map(r => r.province)))
    : [];

  // Unique districts for this zipCode + province
  const districtOptions: string[] = (hasMatches && province)
    ? Array.from(new Set(
        matchesByZip
          .filter(r => r.province === province)
          .map(r => r.district)
      ))
    : [];

  // Unique subdistricts for this zipCode + province + district
  const subdistrictOptions: string[] = (hasMatches && province && district)
    ? Array.from(new Set(
        matchesByZip
          .filter(r => r.province === province && r.district === district)
          .map(r => r.subdistrict)
      ))
    : [];

  /**
   * Called when the zipCode field changes.
   * Returns a partial patch to apply to formData.
   */
  const handleZipCodeChange = useCallback((zip: string): Partial<PostcodeFormFields> => {
    if (zip.length !== 5) {
      return { province: "", district: "", subdistrict: "" };
    }
    const matched = postCode.filter(r => r.postcode === zip);
    if (matched.length === 0) {
      return { province: "", district: "", subdistrict: "" };
    }
    const provinces = Array.from(new Set(matched.map(r => r.province)));
    if (provinces.length === 1) {
      // Auto-fill province when unique
      const singleProvince = provinces[0];
      const districts = Array.from(new Set(matched.filter(r => r.province === singleProvince).map(r => r.district)));
      if (districts.length === 1) {
        const singleDistrict = districts[0];
        const subdistricts = Array.from(new Set(matched.filter(r => r.province === singleProvince && r.district === singleDistrict).map(r => r.subdistrict)));
        if (subdistricts.length === 1) {
          return { province: singleProvince, district: singleDistrict, subdistrict: subdistricts[0] };
        }
        return { province: singleProvince, district: singleDistrict, subdistrict: "" };
      }
      return { province: singleProvince, district: "", subdistrict: "" };
    }
    // Multiple provinces — let user pick
    return { province: "", district: "", subdistrict: "" };
  }, []);

  /**
   * Called when the province dropdown changes.
   * Returns a partial patch to apply to formData.
   */
  const handleProvinceChange = useCallback((newProvince: string): Partial<PostcodeFormFields> => {
    return { province: newProvince, district: "", subdistrict: "" };
  }, []);

  /**
   * Called when the district dropdown changes.
   * Returns a partial patch to apply to formData.
   */
  const handleDistrictChange = useCallback((newDistrict: string): Partial<PostcodeFormFields> => {
    return { district: newDistrict, subdistrict: "" };
  }, []);

  return {
    provinceOptions,
    districtOptions,
    subdistrictOptions,
    hasMatches,
    handleZipCodeChange,
    handleProvinceChange,
    handleDistrictChange,
  };
}
