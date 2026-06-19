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
    title: string;
    subtitle: string;
    promotions: string;
    discount: string;
    ourProducts: string;
    ourProductsSubtitle: string;
    noProducts: string;
    categoriesTitle: string;
    categoriesSubtitle: string;
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
    couetteDesc: string;
    drapTitle: string;
    drapDesc: string;
    parureTitle: string;
    parureDesc: string;
    viewAll: string;
  };
  filters: {
    searchPlaceholder: string;
    all: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    resultsNone: string;
    clear: string;
  };
  product: {
    back: string;
    video: string;
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
    sendWhatsapp: string;
    whatsappHint: string;
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
