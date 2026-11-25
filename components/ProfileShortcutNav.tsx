"use client";

import { IdCard, Landmark, MapPin, PenLine, Phone, UserRound } from "lucide-react";
import FormSectionNav, { FormSection } from "@/components/FormSectionNav";

/** id of the save button inside AgentProfileForm — the sidebar's Save presses it */
export const PROFILE_SAVE_BUTTON_ID = "profile-save-button";

const SECTIONS: FormSection[] = [
  { id: "sec-account", label: "Account", title: "บัญชีผู้ใช้", Icon: UserRound },
  { id: "sec-personal", label: "Personal", title: "ข้อมูลส่วนตัว", Icon: IdCard },
  { id: "sec-address", label: "Address", title: "ที่อยู่ตามบัตรประชาชน", Icon: MapPin },
  { id: "sec-contact", label: "Contact", title: "ข้อมูลติดต่อ", Icon: Phone },
  { id: "sec-bank", label: "Bank", title: "บัญชีรับค่าคอมมิชชั่น", Icon: Landmark },
  { id: "sec-signature", label: "Signature", title: "ลายเซ็น", Icon: PenLine },
];

/** Shortcut tiles for /myprofile (same sidebar as the asset and landlord forms) */
export default function ProfileShortcutNav() {
  return <FormSectionNav sections={SECTIONS} onSave={() => document.getElementById(PROFILE_SAVE_BUTTON_ID)?.click()} />;
}
