import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Success() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const orderId = params.get("orderId");

  const { data: order } = trpc.orders.getById.useQuery(
    { id: orderId || "" },
    { enabled: !!orderId }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-green-900 mb-2">¡Pago Exitoso!</h1>
          <p className="text-gray-600">Tu pedido ha sido confirmado y procesado correctamente.</p>
        </div>

        {order && (
          <Card className="border-green-100 mb-8">
            <CardHeader>
              <CardTitle>Detalles del Pedido</CardTitle>
              <CardDescription>Número de pedido: {order.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="text-lg font-semibold text-green-600">Completado</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Método de Pago</p>
                  <p className="text-lg font-semibold">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-semibold">€{(order.totalAmount / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="text-lg font-semibold">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("es-ES") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t border-green-100 pt-6">
                <h3 className="font-semibold mb-4">Productos Comprados</h3>
                <div className="space-y-2">
                  {(order.items as any[])?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-semibold">
                        €{((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📧 Se ha enviado un correo de confirmación a tu dirección de email registrada.
                  Incluye los detalles del pedido y la información de seguimiento.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-green-600 hover:bg-green-700"
          >
            Volver a la Tienda
          </Button>
          <Button
            onClick={() => (window.location.href = "/orders")}
            variant="outline"
            className="border-green-200 hover:bg-green-50"
          >
            Ver Mis Pedidos
          </Button>
        </div>
      </div>
    </div>
  );
}

