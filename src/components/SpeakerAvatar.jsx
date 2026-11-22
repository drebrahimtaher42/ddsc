import { useState, useEffect } from 'react';

export function SpeakerAvatar({
  photo,
  name,
  initials,
  avatarTone = 'navy',
  size = 'md',
  zoomOnHover = true,
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photo]);

  const showImage = Boolean(photo) && !imgError;

  const sizeClasses =
    size === 'lg'
      ? 'h-16 w-16 text-base p-[2.5px]'
      : size === 'sm'
      ? 'h-12 w-12 text-sm p-[2px]'
      : size === 'xs'
      ? 'h-9 w-9 text-[11px] p-[1.5px]'
      : 'h-14 w-14 text-base p-[2.5px]';

  const innerPad = size === 'xs' ? 'p-[1.5px]' : 'p-[2px]';

  const fallbackGradient =
    avatarTone === 'emerald'
      ? 'bg-gradient-to-br from-[#086958] to-[#3AB498]'
      : 'bg-gradient-to-br from-[#0D224C] to-[#1D3E78]';

  return (
    <div
      className={`relative shrink-0 rounded-full bg-gradient-to-tr from-[#0D224C] via-[#086958] to-[#3AB498] shadow-xs ${sizeClasses}`}
    >
      <div className={`h-full w-full overflow-hidden rounded-full bg-white ${innerPad}`}>
        <div
          className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full text-white font-display font-bold ${
            showImage ? 'bg-[#F4F7F9]' : fallbackGradient
          }`}
        >
          {showImage ? (
            <img
              src={photo}
              alt={name}
              loading="lazy"
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover ${
                zoomOnHover
                  ? 'transition-transform duration-300 ease-out group-hover:scale-110'
                  : ''
              }`}
            />
          ) : (
            <span
              className={
                zoomOnHover
                  ? 'transition-transform duration-300 ease-out group-hover:scale-105'
                  : ''
              }
            >
              {initials}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
