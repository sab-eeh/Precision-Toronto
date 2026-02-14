// src/context/BookingContext.jsx
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

/* =============================
   Storage & Versioning
============================= */

const STORAGE_VERSION = 2;
const STORAGE_KEY = "precision_booking_v2";

const nowISO = () => new Date().toISOString();

const isBrowser = typeof window !== "undefined";

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
    /* quota/full – ignore */
  }
};

const safeRemove = (key) => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
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

const normalizeItem = (item) => ({
  ...item,
  id: item?.id ?? item?.title, // fall back to title for id
  qty: clampQty(item?.qty),
  price: toMoney(item?.price),
});

const normalizeList = (list) =>
  Array.isArray(list) ? list.map(normalizeItem) : [];

const DEFAULT_BOOKING = Object.freeze({
  version: STORAGE_VERSION,
  status: "idle", // "idle" | "in-progress"
  carType: "",
  services: [],
  addons: [],
  customerInfo: {}, // { name, phone, email, address, notes }
  createdAt: null,
  updatedAt: null,
});

/** merge and normalize (keeps schema correct) */
const mergeWithDefault = (obj) => {
  const base = { ...DEFAULT_BOOKING, ...(obj || {}) };
  return {
    ...base,
    version: STORAGE_VERSION,
    services: normalizeList(base.services),
    addons: normalizeList(base.addons),
  };
};

/** Load & migrate storage */
const loadInitial = () => {
  const raw = safeGet(STORAGE_KEY);
  if (!raw) {
    const fresh = mergeWithDefault({
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    return fresh;
  }
  const parsed = safeParse(raw, null);
  if (!parsed || parsed.version !== STORAGE_VERSION) {
    // migrate: keep carType if present, reset the rest
    const fresh = mergeWithDefault({
      carType: parsed?.carType || "",
      status: "idle",
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
    safeSet(STORAGE_KEY, fresh);
    return fresh;
  }
  return mergeWithDefault(parsed);
};

/* =============================
   Reducer (single source of truth)
============================= */

const types = {
  SET_BOOKING: "SET_BOOKING",
  RESET: "RESET",
  CONFIRM: "CONFIRM",
  TOGGLE_SERVICE: "TOGGLE_SERVICE",
  TOGGLE_ADDON: "TOGGLE_ADDON",
  INC_SERVICE: "INC_SERVICE",
  DEC_SERVICE: "DEC_SERVICE",
  INC_ADDON: "INC_ADDON",
  DEC_ADDON: "DEC_ADDON",
};

const upsert = (list, item, delta = 0) => {
  const key = item?.id ?? item?.title;
  const idx = list.findIndex((x) => x.id === key);
  if (idx === -1) {
    return [...list, normalizeItem({ ...item, id: key, qty: 1 })];
  }
  const next = [...list];
  const cur = next[idx];
  const qty = Math.max(0, (cur.qty || 1) + delta);
  if (qty === 0) {
    next.splice(idx, 1);
  } else {
    next[idx] = normalizeItem({ ...cur, qty });
  }
  return next;
};

const toggle = (list, item) => {
  const key = item?.id ?? item?.title;
  const exists = list.some((x) => x.id === key);
  return exists
    ? list.filter((x) => x.id !== key)
    : upsert(list, { ...item, id: key, qty: 1 });
};

const reducer = (state, action) => {
  switch (action.type) {
    case types.SET_BOOKING: {
      const base =
        typeof action.payload === "function"
          ? action.payload(state)
          : { ...state, ...action.payload };
      const next = mergeWithDefault({
        ...base,
        status: base.status || "in-progress",
        createdAt: state.createdAt || nowISO(),
        updatedAt: nowISO(),
      });
      return next;
    }

    case types.RESET: {
      return mergeWithDefault({
        status: "idle",
        carType: "",
        services: [],
        addons: [],
        customerInfo: {},
        createdAt: nowISO(),
        updatedAt: nowISO(),
      });
    }

    case types.CONFIRM: {
      // reducer returns the cleared draft; snapshot done outside via ref
      return mergeWithDefault({
        status: "idle",
        carType: "",
        services: [],
        addons: [],
        customerInfo: {},
        createdAt: nowISO(),
        updatedAt: nowISO(),
      });
    }

    case types.TOGGLE_SERVICE: {
      const services = toggle(state.services, action.payload);
      return mergeWithDefault({
        ...state,
        services,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.TOGGLE_ADDON: {
      const addons = toggle(state.addons, action.payload);
      return mergeWithDefault({
        ...state,
        addons,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.INC_SERVICE: {
      const services = upsert(state.services, { id: action.payload }, +1);
      return mergeWithDefault({
        ...state,
        services,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.DEC_SERVICE: {
      const services = upsert(state.services, { id: action.payload }, -1);
      return mergeWithDefault({
        ...state,
        services,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.INC_ADDON: {
      const addons = upsert(state.addons, { id: action.payload }, +1);
      return mergeWithDefault({
        ...state,
        addons,
        status: "in-progress",
        updatedAt: nowISO(),
      });
    }

    case types.DEC_ADDON: {
      const addons = upsert(state.addons, { id: action.payload }, -1);
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
  setBooking: () => {},
  resetBooking: () => {},
  confirmBooking: async () => {},
  toggleService: () => {},
  toggleAddon: () => {},
  incrementService: () => {},
  decrementService: () => {},
  incrementAddon: () => {},
  decrementAddon: () => {},
  totalPrice: 0,
});

export function BookingProvider({ children }) {
  const [booking, dispatch] = useReducer(reducer, undefined, loadInitial);

  // Keep lastConfirmed in a ref + state to avoid accidental persistence
  const lastConfirmedRef = useRef(null);
  const [lastConfirmed, setLastConfirmed] = React.useState(null);

  /* ---------- Debounced persist ---------- */
  const persistTimer = useRef(null);
  useEffect(() => {
    if (!isBrowser) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      // We only persist the draft (booking state). Confirmation clears storage explicitly.
      safeSet(STORAGE_KEY, booking);
    }, 120);
    return () => clearTimeout(persistTimer.current);
  }, [booking]);

  /* ---------- Cross-tab sync ---------- */
  useEffect(() => {
    if (!isBrowser) return;
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        const raw = safeGet(STORAGE_KEY);
        const parsed = safeParse(raw, DEFAULT_BOOKING);
        // Reuse reducer: dispatch SET_BOOKING so normalization stays consistent
        dispatch({ type: types.SET_BOOKING, payload: parsed });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* ---------- Public API (stable callbacks) ---------- */
  const setBooking = useCallback(
    (updater) => dispatch({ type: types.SET_BOOKING, payload: updater }),
    []
  );

  const resetBooking = useCallback(() => {
    setLastConfirmed(null);
    lastConfirmedRef.current = null;
    dispatch({ type: types.RESET });
    // also write reset to storage so fresh visitors start clean
    safeSet(
      STORAGE_KEY,
      mergeWithDefault({
        status: "idle",
        carType: "",
        services: [],
        addons: [],
        customerInfo: {},
        createdAt: nowISO(),
        updatedAt: nowISO(),
      })
    );
  }, []);

  /**
   * confirmBooking
   * Call AFTER backend confirmation succeeds.
   * - snapshot current draft to `lastConfirmed`
   * - clear localStorage
   * - reset in-memory draft
   */
  const confirmBooking = useCallback(() => {
    const snapshot = mergeWithDefault(booking);
    lastConfirmedRef.current = snapshot;
    setLastConfirmed(snapshot);

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
