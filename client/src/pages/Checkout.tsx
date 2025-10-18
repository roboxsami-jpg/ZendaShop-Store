import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CreditCard, Loader } from "lucide-react";

export default function Checkout() {
  const [location] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("paypal");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const params = new URLSearchParams(location.split("?")[1]);
  const orderId = params.get("orderId");

  const { data: order } = trpc.orders.getById.useQuery(
    { id: orderId || "" },
    { enabled: !!orderId }
  );

  const updateOrderMutation = trpc.orders.updateStatus.useMutation();

  const handlePayPalPayment = async () => {
    if (!orderId) return;
    setIsProcessing(true);

    try {
      // Simulate PayPal payment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await updateOrderMutation.mutateAsync({
        id: orderId,
        status: "completed",
      });

      // Redirect to success page
      window.location.href = `/success?orderId=${orderId}`;
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    if (!orderId || !cardData.cardNumber || !cardData.expiryDate || !cardData.cvv) {
      alert("Por favor completa todos los campos");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate card payment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await updateOrderMutation.mutateAsync({
        id: orderId,
        status: "completed",
      });

      // Redirect to success page
      window.location.href = `/success?orderId=${orderId}`;
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const total = order.totalAmount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-green-900 mb-8">Pago Seguro</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-4 border-green-100">
              <CardHeader>
                <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <div className="border-t border-green-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      €{(total / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="md:col-span-2 space-y-6">
            {/* PayPal */}
            <Card
              className={`cursor-pointer border-2 transition-colors ${
                paymentMethod === "paypal"
                  ? "border-green-600 bg-green-50"
                  : "border-green-100 hover:border-green-300"
              }`}
              onClick={() => setPaymentMethod("paypal")}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    P
                  </div>
                  PayPal
                </CardTitle>
                <CardDescription>Pago rápido y seguro con PayPal</CardDescription>
              </CardHeader>
              {paymentMethod === "paypal" && (
                <CardContent>
                  <Button
                    onClick={handlePayPalPayment}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Pagar con PayPal"
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Credit Card */}
            <Card
              className={`cursor-pointer border-2 transition-colors ${
                paymentMethod === "card"
                  ? "border-green-600 bg-green-50"
                  : "border-green-100 hover:border-green-300"
              }`}
              onClick={() => setPaymentMethod("card")}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Tarjeta de Crédito/Débito
                </CardTitle>
                <CardDescription>Visa, Mastercard, American Express</CardDescription>
              </CardHeader>
              {paymentMethod === "card" && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Titular
                    </label>
                    <Input
                      placeholder="Juan Pérez"
                      value={cardData.cardholderName}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          cardholderName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Tarjeta
                    </label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardData.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, "");
                        if (value.length <= 16) {
                          const formatted = value
                            .replace(/(\d{4})/g, "$1 ")
                            .trim();
                          setCardData({ ...cardData, cardNumber: formatted });
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Vencimiento
                      </label>
                      <Input
                        placeholder="MM/YY"
                        value={cardData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + "/" + value.slice(2, 4);
                          }
                          setCardData({ ...cardData, expiryDate: value });
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <Input
                        placeholder="123"
                        type="password"
                        value={cardData.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 4) {
                            setCardData({ ...cardData, cvv: value });
                          }
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCardPayment}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      `Pagar €${(total / 100).toFixed(2)}`
                    )}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                🔒 <strong>Pago 100% Seguro:</strong> Todos los pagos se procesan de forma segura
                con encriptación SSL. Tus datos nunca se almacenan en nuestros servidores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

