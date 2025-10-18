import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { MessageCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function ProductModal({ product, onClose, onSupport }: any) {
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const addToCartMutation = trpc.cart.addItem.useMutation();
  const createOrderMutation = trpc.orders.create.useMutation();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
        selectedColor: selectedColor || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setIsLoading(true);
    try {
      // Create order directly
      const order = await createOrderMutation.mutateAsync({
        items: [
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            selectedColor,
          },
        ],
        totalAmount: product.price * quantity,
        paymentMethod: "pending",
      });

      // Redirect to payment
      window.location.href = `/checkout?orderId=${order.id}`;
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-3xl font-bold text-green-600 mb-4">
                €{(product.price / 100).toFixed(2)}
              </p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-md border-2 transition-colors ${
                          selectedColor === color
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-green-400"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-4 py-1 border border-gray-300 rounded">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleBuyNow}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Procesando..." : "Comprar Ahora"}
              </Button>
              <Button
                onClick={handleAddToCart}
                disabled={isLoading}
                variant="outline"
                className="w-full border-green-200 hover:bg-green-50"
              >
                {isLoading ? "Procesando..." : "Añadir al Carrito"}
              </Button>
              <Button
                onClick={onSupport}
                variant="ghost"
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Consultar Soporte
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

