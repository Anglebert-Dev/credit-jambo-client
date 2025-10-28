interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loader = ({ size = 'md', fullScreen = false }: LoaderProps) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const loader = (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-[#00A651]`}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
};

