import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFoundContent from "@/components/NotFoundContent";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <NotFoundContent />

      <Footer />
    </div>
  );
}
