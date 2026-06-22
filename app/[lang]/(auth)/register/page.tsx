import { redirect } from "next/navigation";

// Registration is currently disabled by admin
export default function RegisterPage() {
  redirect("/login");
}
