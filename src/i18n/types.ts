export type QA = { q: string; a: string };
export type Testimonial = { name: string; location: string; text: string };

export type Dictionary = {
  siteName: string;
  siteTagline: string;
  nav: {
    home: string;
    products: string;
    order: string;
    contact: string;
    menu: string;
    close: string;
    language: string;
  };
  footer: {
    tagline: string;
    rights: string;
    ownerSpace: string;
    quickLinks: string;
    contact: string;
    hours: string;
    hoursValue: string;
    location: string;
    locationValue: string;
    paymentNote: string;
  };
  hero: {
    eyebrow: string;
    chipDelivery: string;
    chipPayment: string;
    chipQuality: string;
  };
  home: {
    promotions: string;
    discount: string;
    ourProducts: string;
    ourProductsSubtitle: string;
    noProducts: string;
    categoriesTitle: string;
    faqTitle: string;
    faqSubtitle: string;
    testimonialsTitle: string;
    testimonialsSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
  };
  trust: {
    deliveryTitle: string;
    deliveryDesc: string;
    paymentTitle: string;
    paymentDesc: string;
    qualityTitle: string;
    qualityDesc: string;
    supportTitle: string;
    supportDesc: string;
  };
  tiles: {
    couetteTitle: string;
    drapTitle: string;
    parureTitle: string;
  };
  filters: {
    searchPlaceholder: string;
    all: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    resultsNone: string;
    resultsCount: string;
    resultsCountOne: string;
    sortLabel: string;
    clear: string;
  };
  product: {
    back: string;
    video: string;
    prevImage: string;
    nextImage: string;
    zoomHint: string;
    openFullscreen: string;
    promo: string;
    orderThis: string;
    orderWhatsapp: string;
    quantity: string;
    benefitsTitle: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    from: string;
  };
  categories: {
    COUETTE: string;
    DRAP: string;
    PARURE: string;
  };
  order: {
    title: string;
    subtitle: string;
    contactInfo: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    sizes: string;
    couetteSize: string;
    drapSize: string;
    notes: string;
    notesPlaceholder: string;
    products: string;
    loadingProducts: string;
    productsUnavailable: string;
    decreaseQty: string;
    increaseQty: string;
    sizeRequired: string;
    choose: string;
    other: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    backHome: string;
    selectProduct: string;
    orderError: string;
    genericError: string;
    summaryTitle: string;
    summaryEmpty: string;
    total: string;
    ref: string;
    newOrder: string;
    addLine: string;
  };
  faq: {
    items: QA[];
  };
  testimonials: {
    items: Testimonial[];
  };
  whatsapp: {
    fabTooltip: string;
    contactCta: string;
  };
  sizes: string[];
};
