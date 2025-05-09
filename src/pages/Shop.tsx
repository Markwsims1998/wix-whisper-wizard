
import { useState, useEffect } from "react";
import { Award, Diamond, Badge as BadgeIcon, Check, ChevronDown, ChevronUp, ShoppingCart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useSubscription, SubscriptionTier, subscriptionPlans } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import ProductItem from "@/components/shop/ProductItem";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Shop = () => {
  const { user, isAuthenticated } = useAuth();
  const { subscriptionTier, upgradeSubscription, getTierBadge, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [showSubscriptions, setShowSubscriptions] = useState(true);
  const [cartItems, setCartItems] = useState<number>(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // Enhanced debugging logs and auth check - also refresh subscription data
  useEffect(() => {
    const checkAuth = async () => {
      // Get session directly from Supabase and refresh subscription
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      
      // Always refresh subscription data when component mounts
      if (session?.user?.id) {
        await refreshSubscription();
      }
      
      console.log("Shop - Auth state detailed check:", { 
        isAuthenticated, 
        userId: user?.id, 
        userEmail: user?.email,
        userName: user?.name,
        subscriptionTier,
        authObjectPresent: !!user,
        hasValidSession: !!session,
        sessionUserId: session?.user?.id,
      });
      
      setAuthCheckDone(true);
      setHasSession(!!session?.user?.id);
      setErrorMessage(null);
    };
    
    checkAuth();
  }, [user, isAuthenticated, refreshSubscription]);

  // Set showSubscriptions based on subscription tier - collapse for premium tiers
  useEffect(() => {
    setShowSubscriptions(subscriptionTier === "free");
  }, [subscriptionTier]);
  
  const handleSubscribe = async (tier: SubscriptionTier) => {
    console.log("Subscribe button clicked for tier:", tier);
    
    // Direct database check for debugging
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    
    // Clear previous error
    setErrorMessage(null);
    
    // Double-check authentication
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      // Direct database update as a fallback if context method fails
      if (session?.user?.id) {
        try {
          console.log("Attempting direct database update with user ID:", session.user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .update({ subscription_tier: tier })
            .eq('id', session.user.id);
            
          if (error) {
            console.error("Direct database update error:", error);
            throw new Error("Database update failed: " + error.message);
          } else {
            console.log("Direct database update successful:", data);
            
            // Still try the context method for state updates
            const contextSuccess = await upgradeSubscription(tier);
            
            toast({
              title: "Subscription Updated",
              description: `Your subscription has been successfully updated to ${tier} tier.`,
            });
            
            return;
          }
        } catch (dbError) {
          console.error("Error in direct database update:", dbError);
        }
      }
      
      // Fall back to the context method if direct update fails
      const success = await upgradeSubscription(tier);
      
      if (success) {
        toast({
          title: "Subscription Updated",
          description: `Your subscription has been successfully updated to ${tier} tier.`,
        });
      } else {
        setErrorMessage("There was a problem updating your subscription. Please try again.");
        toast({
          title: "Subscription Error",
          description: "There was a problem updating your subscription. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      setErrorMessage("There was a problem updating your subscription. Please try again.");
      toast({
        title: "Subscription Error",
        description: "There was a problem updating your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const tierDetails = [
    {
      tier: "gold" as SubscriptionTier,
      title: "Gold Tier",
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      color: "bg-gradient-to-br from-yellow-300 to-yellow-600",
      highlightColor: "border-yellow-500",
      price: "£24.99",
      features: [
        "Unlimited messages",
        "Full access to all photos",
        "Full access to all videos",
        "No watermarks on photos",
        "Premium support",
        "Early access to new features"
      ]
    },
    {
      tier: "silver" as SubscriptionTier,
      title: "Silver Tier",
      icon: <Diamond className="h-8 w-8 text-gray-400" />,
      color: "bg-gradient-to-br from-gray-300 to-gray-500",
      highlightColor: "border-gray-400",
      price: "£14.99",
      features: [
        "1,000 messages per month",
        "Full access to all photos",
        "Full access to all videos",
        "Standard support"
      ]
    },
    {
      tier: "bronze" as SubscriptionTier,
      title: "Bronze Tier",
      icon: <BadgeIcon className="h-8 w-8 text-amber-700" />,
      color: "bg-gradient-to-br from-amber-500 to-amber-800",
      highlightColor: "border-amber-700",
      price: "£9.99",
      features: [
        "500 messages per month",
        "Access to photos",
        "Access to videos",
        "Basic support"
      ]
    }
  ];

  // More realistic product categories and items for the shop
  const productCategories = [
    {
      name: "Apparel",
      items: [
        { id: "p1", name: "HappyKinks T-Shirt", price: "£19.99", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.5, reviews: 24 },
        { id: "p2", name: "Logo Hoodie", price: "£39.99", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.8, reviews: 42 },
        { id: "p3", name: "Beanie Hat", price: "£14.99", image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.2, reviews: 15 },
        { id: "p4", name: "Vintage Cap", price: "£18.99", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.0, reviews: 8 }
      ]
    },
    {
      name: "Accessories",
      items: [
        { id: "p5", name: "Canvas Tote Bag", price: "£12.99", image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.3, reviews: 18 },
        { id: "p6", name: "Phone Case", price: "£15.99", image: "https://images.unsplash.com/photo-1541877944-ac82a091518a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.6, reviews: 31 },
        { id: "p7", name: "Enamel Pin Set", price: "£7.99", image: "https://images.unsplash.com/photo-1590845947376-2638caa89309?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.4, reviews: 12 },
        { id: "p8", name: "Sticker Pack", price: "£5.99", image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.7, reviews: 46 }
      ]
    },
    {
      name: "Home & Living",
      items: [
        { id: "p9", name: "Ceramic Mug", price: "£13.99", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.9, reviews: 37 },
        { id: "p10", name: "Throw Pillow", price: "£21.99", image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.5, reviews: 22 },
        { id: "p11", name: "Wall Art Print", price: "£24.99", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.8, reviews: 14 },
        { id: "p12", name: "Laptop Sleeve", price: "£19.99", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.6, reviews: 27 }
      ]
    },
    {
      name: "Digital Content",
      items: [
        { id: "p13", name: "Exclusive Ebook", price: "£8.99", image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.3, reviews: 19 },
        { id: "p14", name: "Community Guidebook", price: "£12.99", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.7, reviews: 26 },
        { id: "p15", name: "Event Calendar", price: "£5.99", image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.0, reviews: 11 },
        { id: "p16", name: "Resource Pack", price: "£9.99", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.2, reviews: 16 }
      ]
    },
    {
      name: "Limited Editions",
      items: [
        { id: "p17", name: "Collector's Box Set", price: "£49.99", image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.9, reviews: 8 },
        { id: "p18", name: "Anniversary Edition Poster", price: "£29.99", image: "https://images.unsplash.com/photo-1579541591970-e5a7277ff211?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.8, reviews: 12 },
        { id: "p19", name: "Special Event Shirt", price: "£34.99", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.7, reviews: 6 },
        { id: "p20", name: "Signed Art Print", price: "£39.99", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80", rating: 4.9, reviews: 9 }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pb-10" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto px-4">
          {/* Shopping Cart and Subscription Status Info */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Shop</h1>
              <p className="text-gray-600">Explore our products and subscription plans</p>
            </div>
            <div className="relative">
              <Button variant="outline" size="icon" className="rounded-full">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 bg-[#8B5CF6] hover:bg-[#7C3AED]">{cartItems}</Badge>
              </Button>
            </div>
          </div>
          
          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {/* Authentication Warning - Only show when truly not authenticated */}
          {authCheckDone && !hasSession && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span>
                  Please sign in to subscribe to a plan or make purchases.
                </span>
                <Link to="/login" className="mt-2 sm:mt-0">
                  <Button size="sm" variant="outline">Login</Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Subscription Status Alert - Always show for premium tiers */}
          {authCheckDone && hasSession && subscriptionTier !== "free" && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="flex items-center">
                <span className="mr-2">Current Subscription: {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Tier</span> 
                {getTierBadge(subscriptionTier)}
              </AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <span>
                  You can manage your subscription in your account settings
                </span>
                <Link to="/settings?tab=subscription" className="mt-2 sm:mt-0">
                  <Button size="sm" variant="outline">Manage Subscription</Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            {/* Collapsible Subscription Plans Section */}
            <div className="mb-8">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setShowSubscriptions(!showSubscriptions)}
              >
                <h2 className="text-lg font-semibold">Subscription Plans</h2>
                <div className="p-1">
                  {showSubscriptions ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
              
              {showSubscriptions && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tierDetails.map((tierInfo) => (
                    <div 
                      key={tierInfo.tier}
                      className={`rounded-lg border-2 overflow-hidden ${
                        subscriptionTier === tierInfo.tier ? tierInfo.highlightColor : "border-transparent"
                      } transition-all hover:shadow-lg`}
                    >
                      <div className={`p-6 ${tierInfo.color} text-white`}>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold">{tierInfo.title}</h3>
                          {tierInfo.icon}
                        </div>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">{tierInfo.price}</span>
                          <span className="text-sm opacity-80">/month</span>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-white">
                        <ul className="space-y-3">
                          {tierInfo.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="mt-6">
                          <Button 
                            className="w-full" 
                            variant={subscriptionTier === tierInfo.tier ? "outline" : "default"}
                            disabled={processing || subscriptionTier === tierInfo.tier}
                            onClick={() => handleSubscribe(tierInfo.tier)}
                          >
                            {processing ? "Processing..." : subscriptionTier === tierInfo.tier ? "Current Plan" : "Subscribe"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Free Plan Details (only show if user is not subscribed) */}
            {subscriptionTier === "free" && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-8">
                <h2 className="text-lg font-medium mb-2">Free Plan Features</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>100 messages per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Access to photos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-5 w-5 flex items-center justify-center text-red-500">✕</span>
                    <span className="text-gray-500">No access to videos</span>
                  </li>
                </ul>
              </div>
            )}
            
            {/* Products Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-8">Shop Products</h2>
              
              {productCategories.map((category, index) => (
                <div key={index} className="mb-12">
                  <h3 className="text-lg font-medium mb-4">{category.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {category.items.map(product => (
                      <ProductItem key={product.id} product={product} />
                    ))}
                  </div>
                  {index < productCategories.length - 1 && <Separator className="my-8" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
