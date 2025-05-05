
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { ShoppingBag, Search, Heart } from "lucide-react";

const Shop = () => {
  // Update header position based on sidebar width
  useEffect(() => {
    const updateHeaderPosition = () => {
      const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      }
    };

    // Initial update
    updateHeaderPosition();

    // Set up observer to detect sidebar width changes
    const observer = new ResizeObserver(updateHeaderPosition);
    const sidebar = document.querySelector('div[class*="bg-[#2B2A33]"]');
    if (sidebar) {
      observer.observe(sidebar);
    }

    return () => {
      if (sidebar) observer.unobserve(sidebar);
    };
  }, []);

  const products = [
    { id: 1, name: 'HappyKinks T-Shirt', price: 24.99, image: 'https://via.placeholder.com/300x300', category: 'Clothing' },
    { id: 2, name: 'Premium Membership', price: 9.99, image: 'https://via.placeholder.com/300x300', category: 'Membership' },
    { id: 3, name: 'Event Ticket', price: 49.99, image: 'https://via.placeholder.com/300x300', category: 'Events' },
    { id: 4, name: 'HappyKinks Mug', price: 14.99, image: 'https://via.placeholder.com/300x300', category: 'Merchandise' },
    { id: 5, name: 'Digital Guide', price: 12.99, image: 'https://via.placeholder.com/300x300', category: 'Digital' },
    { id: 6, name: 'HappyKinks Cap', price: 19.99, image: 'https://via.placeholder.com/300x300', category: 'Clothing' }
  ];

  const categories = ['All', 'Clothing', 'Membership', 'Events', 'Merchandise', 'Digital'];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Header />
      
      <div className="pl-[280px] pt-16 pr-4 pb-10 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 280px)' }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold">Shop</h1>
                <div className="border-b-2 border-purple-500 w-16 mt-1"></div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button 
                  key={category} 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-purple-100 hover:text-purple-700 whitespace-nowrap"
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                    <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-gray-100 transition">
                      <Heart className="h-4 w-4 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-purple-600 font-bold">${product.price}</p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                    </div>
                    <button className="mt-3 bg-purple-600 text-white w-full py-2 rounded-md hover:bg-purple-700 transition flex items-center justify-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Add to Cart
                    </button>
                  </div>
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
