import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { QuickViewModal } from "@/components/product/QuickViewModal";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />

      {/* Global overlays */}
      <CartDrawer />
      <SearchOverlay />
      <QuickViewModal />
    </div>
  );
}
