import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Trash2 } from "lucide-react";

export default function CartSidebar({ open, onOpenChange, items, products, total }: any) {
  const removeFromCartMutation = trpc.cart.removeItem.useMutation();
  const updateQuantityMutation = trpc.cart.updateQuantity.useMutation();
  const createOrderMutation = trpc.orders.create.useMutation();

  const handleRemoveItem = async (id: string) => {
    await removeFromCartMutation.mutateAsync({ id });
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity > 0) {
      await updateQuantityMutation.mutateAsync({ id, quantity });
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      const order = await createOrderMutation.mutateAsync({
        items: items.map((item: any) => ({
          productId: item.productId,
          name: item.product?.name,
          price: item.product?.price,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
        })),
        totalAmount: total,
        paymentMethod: "pending",
      });

      // Redirect to payment
      window.location.href = `/checkout?orderId=${order.id}`;
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Carrito de Compras</SheetTitle>
          <SheetDescription>
            {items.length} {items.length === 1 ? "artículo" : "artículos"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4 flex-1 overflow-y-auto max-h-96">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Tu carrito está vacío</p>
          ) : (
            items.map((item: any) => {
              const product = products.find((p: any) => p.id === item.productId);
              return (
                <div
                  key={item.id}
                  className="flex gap-4 border-b border-green-100 pb-4"
                >
                  <img
                    src={product?.image}
                    alt={product?.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{product?.name}</h4>
                    {item.selectedColor && (
                      <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                    )}
                    <p className="text-green-600 font-bold mt-1">
                      €{((product?.price || 0) / 100).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-2">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-8 pt-4 border-t border-green-200 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600">€{(total / 100).toFixed(2)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Proceder al Pago
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

