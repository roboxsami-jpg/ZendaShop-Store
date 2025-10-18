import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { ShoppingCart, Search, MessageCircle, Leaf } from "lucide-react";
import ProductModal from "@/components/ProductModal";
import CartSidebar from "@/components/CartSidebar";
import SupportChat from "@/components/SupportChat";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showCart, setShowCart] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [supportProductId, setSupportProductId] = useState<string | undefined | null>(undefined);

  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: cartItems = [] } = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Categorize products
  const mainProducts = filteredProducts.filter((p) => !p.comingSoon);
  const upcomingProducts = filteredProducts.filter((p) => p.comingSoon);

  const handleOpenSupport = (productId?: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSupportProductId(productId);
    setShowSupport(true);
  };

  const handleBuyProduct = (product: any) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setSelectedProduct(product);
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-green-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-green-700">{APP_TITLE}</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-green-200 focus:border-green-500"
              />
              <Search className="absolute left-3 top-3 w-5 h-5 text-green-500" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCart(true)}
                  className="relative border-green-200 hover:bg-green-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenSupport()}
                  className="border-green-200 hover:bg-green-50"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-green-600 hover:bg-green-700"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Featured Section */}
        {mainProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-green-900 mb-8 flex items-center gap-2">
              <span className="w-1 h-8 bg-green-600"></span>
              Destacados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mainProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onBuy={() => handleBuyProduct(product)}
                  onAddToCart={() => {
                    if (!isAuthenticated) {
                      window.location.href = getLoginUrl();
                      return;
                    }
                    setSelectedProduct(product);
                  }}
                  onSupport={() => handleOpenSupport(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Products */}
        {upcomingProducts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-green-900 mb-8 flex items-center gap-2">
              <span className="w-1 h-8 bg-green-600"></span>
              Próximamente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden opacity-60"
                >
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                    <p className="text-green-600 font-bold mt-2">€{(product.price / 100).toFixed(2)}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-white font-bold text-xl">Próximamente</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSupport={() => {
            setSelectedProduct(null);
            handleOpenSupport(selectedProduct.id);
          }}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        open={showCart}
        onOpenChange={setShowCart}
        items={cartItems}
        products={products}
        total={cartTotal}
      />

      {/* Support Chat */}
      {showSupport && (
        <SupportChat
          productId={supportProductId}
          onClose={() => setShowSupport(false)}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onBuy, onAddToCart, onSupport }: any) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-green-100">
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-green-900">{product.name}</CardTitle>
        <CardDescription className="text-green-600 font-bold text-lg">
          €{(product.price / 100).toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex gap-2">
          <Button
            onClick={onBuy}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            Comprar
          </Button>
          <Button
            onClick={onAddToCart}
            variant="outline"
            className="flex-1 border-green-200 hover:bg-green-50"
            size="sm"
          >
            Carrito
          </Button>
          <Button
            onClick={onSupport}
            variant="ghost"
            size="sm"
            className="px-2"
            title="Consultar"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

