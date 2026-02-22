// src/context/BookingContext.jsx
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

/* ============================================================================
   BookingContext — Precision Toronto
   - Draft booking persists in localStorage
   - Confirmation clears all selections
   - Normalized schema + versioning
   - Safe for production + cross-tab sync
============================================================================ */

/* =============================
   Storage & Versioning
============================= */

const STORAGE_VERSION = 2;
const STORAGE_KEY = "precision_booking_v2";

const isBrowser = typeof window !== "undefined";

const nowISO = () => new Date().toISOString();

const safeParse = (s, fallback) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

const safeGet = (key) => (isBrowser ? window.localStorage.getItem(key) : null);

const safeSet = (key, val) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // storage quota exceeded or blocked
  }
};

const safeRemove = (key) => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

/* =============================
   Helpers / Normalizers
============================= */

const toMoney = (n) => {
  const num = Number(n);
  return Number.isFinite(num) ? num : 0;
};

const clampQty = (q) => Math.max(1, Number(q || 1));

const normalizeItem = (item) => {
  const id = item?.id ?? item?.title ?? cryptoRandomId();
  return {
    ...item,
    id,
    title: item?.title ?? "",
    qty: clampQty(item?.qty),
    price: toMoney(item?.price),
  };
};

const normalizeList = (list) =>
  Array.isArray(list) ? list.map(normalizeItem) : [];

// fallback for older browsers
function cryptoRandomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
  }
}

/* =============================
   Default Booking Schema
============================= */

const DEFAULT_BOOKING = Object.freeze({
  version: STORAGE_VERSION,

  status: "idle", // "idle" | "in-progress"

  carType: "",

  services: [],
  addons: [],

  customerInfo: {
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  },

  // You can add these later if needed:
  // bookingDate: null,
  // bookingTime: null,

  createdAt: null,
  updatedAt: null,
});

/** Merge + normalize (guarantees correct schema always) */
const mergeWithDefault = (obj) => {
  const base = { ...DEFAULT_BOOKING, ...(obj || {}) };

  return {
    ...base,
    version: STORAGE_VERSION,
    services: normalizeList(base.services),
    addons: normalizeList(base.addons),
    customerInfo: {
      ...DEFAULT_BOOKING.customerInfo,
      ...(base.customerInfo || {}),
    },
  };
};

/** Load initial state (with migration support) */
const loadInitial = () => {
  const raw = safeGet(STORAGE_KEY);

  // First time visitor
  if (!raw) {
    return mergeWithDefault({
      status: "idle",
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  }

  const parsed = safeParse(raw, null);

  // Corrupt storage
  if (!parsed) {
    const fresh = mergeWithDefault({
      status: "idle",
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    safeSet(STORAGE_KEY, fresh);
    return fresh;
  }

  // Version mismatch (migration)
  if (parsed.version !== STORAGE_VERSION) {
    // Keep carType only, reset everything else
    const fresh = mergeWithDefault({
      status: "idle",
      carType: parsed?.carType || "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    safeSet(STORAGE_KEY, fresh);
    return fresh;
  }

  return mergeWithDefault(parsed);
};

/* =============================
   Reducer
============================= */

const types = {
  SET_BOOKING: "SET_BOOKING",
  RESET: "RESET",
  CONFIRM: "CONFIRM",

  SET_CAR_TYPE: "SET_CAR_TYPE",
  SET_CUSTOMER_INFO: "SET_CUSTOMER_INFO",

  TOGGLE_SERVICE: "TOGGLE_SERVICE",
  TOGGLE_ADDON: "TOGGLE_ADDON",

  INC_SERVICE: "INC_SERVICE",
  DEC_SERVICE: "DEC_SERVICE",
  INC_ADDON: "INC_ADDON",
  DEC_ADDON: "DEC_ADDON",
};

/** Upsert by id — requires full item when adding new */
const upsertWithDelta = (list, item, delta) => {
  const id = item?.id ?? item?.title;
  if (!id) return list;

  const idx = list.findIndex((x) => x.id === id);

  // If not found, only add if we have a full item (title/price)
  if (idx === -1) {
    // If delta is negative, do nothing
    if (delta < 0) return list;

    return [...list, normalizeItem({ ...item, id, qty: 1 })];
  }

  const next = [...list];
  const cur = next[idx];

  const qty = Math.max(0, clampQty(cur.qty) + delta);

  if (qty === 0) {
    next.splice(idx, 1);
    return next;
  }

  next[idx] = normalizeItem({ ...cur, qty });
  return next;
};

const toggleItem = (list, item) => {
  const id = item?.id ?? item?.title;
  if (!id) return list;

  const exists = list.some((x) => x.id === id);

  // remove
  if (exists) return list.filter((x) => x.id !== id);

  // add
  return [...list, normalizeItem({ ...item, id, qty: 1 })];
};

const reducer = (state, action) => {
  switch (action.type) {
    case types.SET_BOOKING: {
      const base =
        typeof action.payload === "function"
          ? action.payload(state)
          : { ...state, ...(action.payload || {}) };

      return mergeWithDefault({
        ...base,
        status: base.status || state.status || "in-progress",
        createdAt: state.createdAt || base.createdAt || nowISO(),
        updatedAt: nowISO(),
      });
    }

    case types.RESET: {
      return mergeWithDefault({
        status: "idle",
        carType: "",
        services: [],
        addons: [],
        customerInfo: DEFAULT_BOOKING.customerInfo,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      });
    }

    case types.CONFIRM: {
      // Clears all selections after successful backend booking confirmation
      return mergeWithDefault({
        status: "idle",
        carType: "",
        services: [],
        addons: [],
        customerInfo: DEFAULT_BOOKING.customerInfo,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      });
    }

    case types.SET_CAR_TYPE: {
      return mergeWithDefault({
        ...state,
        carType: action.payload || "",
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.SET_CUSTOMER_INFO: {
      return mergeWithDefault({
        ...state,
        customerInfo: {
          ...state.customerInfo,
          ...(action.payload || {}),
        },
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.TOGGLE_SERVICE: {
      const services = toggleItem(state.services, action.payload);
      return mergeWithDefault({
        ...state,
        services,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.TOGGLE_ADDON: {
      const addons = toggleItem(state.addons, action.payload);
      return mergeWithDefault({
        ...state,
        addons,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    // IMPORTANT: INC/DEC now require existing item
    case types.INC_SERVICE: {
      const id = action.payload;
      const cur = state.services.find((x) => x.id === id);
      if (!cur) return state;
      const services = upsertWithDelta(state.services, cur, +1);
      return mergeWithDefault({
        ...state,
        services,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.DEC_SERVICE: {
      const id = action.payload;
      const cur = state.services.find((x) => x.id === id);
      if (!cur) return state;
      const services = upsertWithDelta(state.services, cur, -1);
      return mergeWithDefault({
        ...state,
        services,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.INC_ADDON: {
      const id = action.payload;
      const cur = state.addons.find((x) => x.id === id);
      if (!cur) return state;
      const addons = upsertWithDelta(state.addons, cur, +1);
      return mergeWithDefault({
        ...state,
        addons,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.DEC_ADDON: {
      const id = action.payload;
      const cur = state.addons.find((x) => x.id === id);
      if (!cur) return state;
      const addons = upsertWithDelta(state.addons, cur, -1);
      return mergeWithDefault({
        ...state,
        addons,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    default:
      return state;
  }
};

/* =============================
   Context
============================= */

export const BookingContext = createContext({
  booking: DEFAULT_BOOKING,
  lastConfirmed: null,

  // actions
  setBooking: () => {},
  resetBooking: () => {},
  confirmBooking: () => {},

  setCarType: () => {},
  setCustomerInfo: () => {},

  toggleService: () => {},
  toggleAddon: () => {},
  incrementService: () => {},
  decrementService: () => {},
  incrementAddon: () => {},
  decrementAddon: () => {},

  // derived
  totalPrice: 0,
});

export function BookingProvider({ children }) {
  const [booking, dispatch] = useReducer(reducer, undefined, loadInitial);

  // Keep lastConfirmed only in memory (NOT in localStorage)
  const [lastConfirmed, setLastConfirmed] = React.useState(null);

  // Prevent writing storage immediately after confirm/reset
  const skipNextPersistRef = useRef(false);

  /* ---------- Persist draft (debounced) ---------- */
  const persistTimer = useRef(null);

  useEffect(() => {
    if (!isBrowser) return;

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    if (persistTimer.current) clearTimeout(persistTimer.current);

    persistTimer.current = setTimeout(() => {
      safeSet(STORAGE_KEY, booking);
    }, 120);

    return () => clearTimeout(persistTimer.current);
  }, [booking]);

  /* ---------- Cross-tab sync ---------- */
  useEffect(() => {
    if (!isBrowser) return;

    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;

      const raw = safeGet(STORAGE_KEY);

      // If storage cleared in another tab, reset this tab too
      if (!raw) {
        dispatch({ type: types.RESET });
        return;
      }

      const parsed = safeParse(raw, null);
      if (!parsed) return;

      // Apply state from storage
      dispatch({ type: types.SET_BOOKING, payload: parsed });
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ---------- Public API (stable callbacks) ---------- */

  const setBooking = useCallback(
    (updater) => dispatch({ type: types.SET_BOOKING, payload: updater }),
    []
  );

  const setCarType = useCallback(
    (carType) => dispatch({ type: types.SET_CAR_TYPE, payload: carType }),
    []
  );

  const setCustomerInfo = useCallback(
    (info) => dispatch({ type: types.SET_CUSTOMER_INFO, payload: info }),
    []
  );

  const resetBooking = useCallback(() => {
    setLastConfirmed(null);
    skipNextPersistRef.current = true;
    safeRemove(STORAGE_KEY);
    dispatch({ type: types.RESET });
  }, []);

  /**
   * confirmBooking
   * Call ONLY after backend booking is successfully created.
   * - snapshot current booking in memory (for confirmation page)
   * - clear localStorage
   * - reset state
   */
  const confirmBooking = useCallback(() => {
    const snapshot = mergeWithDefault(booking);
    setLastConfirmed(snapshot);

    skipNextPersistRef.current = true;
    safeRemove(STORAGE_KEY);
    dispatch({ type: types.CONFIRM });
  }, [booking]);

  const toggleService = useCallback(
    (service) => dispatch({ type: types.TOGGLE_SERVICE, payload: service }),
    []
  );

  const toggleAddon = useCallback(
    (addon) => dispatch({ type: types.TOGGLE_ADDON, payload: addon }),
    []
  );

  const incrementService = useCallback(
    (id) => dispatch({ type: types.INC_SERVICE, payload: id }),
    []
  );

  const decrementService = useCallback(
    (id) => dispatch({ type: types.DEC_SERVICE, payload: id }),
    []
  );

  const incrementAddon = useCallback(
    (id) => dispatch({ type: types.INC_ADDON, payload: id }),
    []
  );

  const decrementAddon = useCallback(
    (id) => dispatch({ type: types.DEC_ADDON, payload: id }),
    []
  );

  /* ---------- Derived: Total Price ---------- */
  const totalPrice = useMemo(() => {
    const serviceTotal = (booking.services || []).reduce(
      (sum, s) => sum + toMoney(s.price) * clampQty(s.qty),
      0
    );

    const addonTotal = (booking.addons || []).reduce(
      (sum, a) => sum + toMoney(a.price) * clampQty(a.qty),
      0
    );

    return Number((serviceTotal + addonTotal).toFixed(2));
  }, [booking.services, booking.addons]);

  const value = useMemo(
    () => ({
      booking,
      lastConfirmed,

      setBooking,
      resetBooking,
      confirmBooking,

      setCarType,
      setCustomerInfo,

      toggleService,
      toggleAddon,
      incrementService,
      decrementService,
      incrementAddon,
      decrementAddon,

      totalPrice,
    }),
    [
      booking,
      lastConfirmed,
      setBooking,
      resetBooking,
      confirmBooking,
      setCarType,
      setCustomerInfo,
      toggleService,
      toggleAddon,
      incrementService,
      decrementService,
      incrementAddon,
      decrementAddon,
      totalPrice,
    ]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}
