
import { useState, useEffect } from "react";
import { Trash2, ArrowLeft, ShoppingBag, CreditCard, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Example basket items data
const initialItems = [
  { id: 1, name: 'HappyKinks T-Shirt', price: 19.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80', quantity: 1 },
  { id: 2, name: 'Logo Hoodie', price: 39.99, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80', quantity: 1 },
  { id: 3, name: 'Enamel Pin Set', price: 7.99, image: 'https://images.unsplash.com/photo-1590845947376-2638caa89309?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80', quantity: 1 }
];

const Basket = () => {
  const [basketItems, setBasketItems] = useState(initialItems);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Log user activity
  useEffect(() => {
    const logActivity = () => {
      console.log("User activity: Viewed basket page");
      // In a real application, this would call an API to record the activity
    };

    logActivity();
    
    // Simulate loading
    setTimeout(() => setLoading(false), 800);

    // Update header position for sidebar width
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    updateHeaderPosition();
    const observer = new ResizeObserver(updateHeaderPosition);
    const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      if (sidebar) observer.unobserve(sidebar);
    };
  }, []);

  const updateQuantity = (id: number, change: number) => {
    setBasketItems(current => 
      current.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) } 
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setBasketItems(current => current.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "The item has been removed from your basket",
    });
  };
  
  const subtotal = basketItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 4.99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pb-10 transition-all duration-300 flex-grow" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Link to="/shop" className="flex items-center gap-1 text-gray-600 hover:text-purple-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to shop</span>
                  </Link>
                  <h1 className="text-2xl font-semibold">Your Basket</h1>
                  <span className="text-gray-500">({basketItems.length} items)</span>
                </div>
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {basketItems.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-6">
                        <h2 className="text-lg font-medium mb-4">Shopping Basket</h2>
                        
                        <div className="space-y-6">
                          {basketItems.map((item) => (
                            <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                              <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-gray-500 text-sm mt-1">Item #{item.id}</p>
                                <div className="flex justify-between items-end mt-2">
                                  <div className="flex items-center border rounded-md">
                                    <button 
                                      onClick={() => updateQuantity(item.id, -1)} 
                                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 py-1">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, 1)} 
                                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                    <button 
                                      onClick={() => removeItem(item.id)} 
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                      <h2 className="text-xl font-medium mb-2">Your basket is empty</h2>
                      <p className="text-gray-500 mb-6">Looks like you haven't added any items to your basket yet.</p>
                      <Link to="/shop">
                        <Button>Continue Shopping</Button>
                      </Link>
                    </div>
                  )}
                </div>
                
                {basketItems.length > 0 && (
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span>${shipping.toFixed(2)}</span>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-6">
                        <CreditCard className="mr-2 h-4 w-4" /> Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Basket;
