
export const adjustLayoutForBanner = (bannerVisible: boolean): void => {
  // Set CSS variables that can be used throughout the app
  if (bannerVisible) {
    document.documentElement.style.setProperty('--banner-height', '40px');
    document.documentElement.classList.add('has-banner');
  } else {
    document.documentElement.style.setProperty('--banner-height', '0px');
    document.documentElement.classList.remove('has-banner');
  }
};
