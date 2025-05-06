
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ProductItemProps {
  product: {
    id: string;
    name: string;
    price: string;
    image: string;
    rating: number;
    reviews: number;
  }
}

const ProductItem = ({ product }: ProductItemProps) => {
  const { toast } = useToast();

  const handleAddToCart = () => {
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition">
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-4">
        <h4 className="font-medium">{product.name}</h4>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex">
            {Array(5).fill(0).map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">{product.rating} ({product.reviews})</span>
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="font-bold">{product.price}</span>
          <Button size="sm" onClick={handleAddToCart}>Add to Cart</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
