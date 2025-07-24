import ProductCard from './ProductCard';

interface ProductCardSkeletonProps {
  count?: number;
  className?: string;
}

const ProductCardSkeleton = ({ count = 1, className }: ProductCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <ProductCard 
          key={`skeleton-${index}`}
          isLoading={true}
          className={className}
        />
      ))}
    </>
  );
};

export default ProductCardSkeleton;
