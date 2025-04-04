import React from 'react';

const SkeletonLoader = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
  inline = false,
  circle = false,
}) => {
  const getSkeletonClasses = () => {
    const baseClasses = 'bg-gray-200 animate-pulse';
    const variantClasses = {
      text: 'h-4 rounded',
      rectangular: 'rounded',
      circular: 'rounded-full',
    };

    return `${baseClasses} ${variantClasses[variant]} ${className}`;
  };

  const getSkeletonStyle = () => {
    const style = {};
    if (width) style.width = width;
    if (height) style.height = height;
    return style;
  };

  const renderSkeleton = () => {
    return [...Array(count)].map((_, index) => (
      <div
        key={index}
        className={`${getSkeletonClasses()} ${inline ? 'inline-block' : 'block'} ${
          index !== count - 1 ? 'mb-2' : ''
        }`}
        style={getSkeletonStyle()}
      />
    ));
  };

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;
