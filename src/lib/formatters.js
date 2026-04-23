const DEFAULT_LOCALE = "en-US";

/**
 * Formats numeric values as localized currency.
 */
const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Formats ISO date values using a preferred timezone.
 */
const formatDate = (date, timezone = "America/New_York") => {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

/**
 * Formats numeric values as percentage text.
 */
const formatPercent = (value) => `${value.toFixed(1)}%`;

export { formatCurrency, formatDate, formatPercent };
