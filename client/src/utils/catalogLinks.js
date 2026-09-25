export const categoryLink = (category, mainCategory) =>
  `/dashboard/category/${encodeURIComponent(category)}${
    mainCategory ? `?mainCategory=${encodeURIComponent(mainCategory)}` : ''
  }`;

export const mainCategoryLink = (mainCategory) =>
  `/dashboard/main/${encodeURIComponent(mainCategory)}`;
