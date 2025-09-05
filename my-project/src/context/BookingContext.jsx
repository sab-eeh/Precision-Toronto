import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** Bump this on schema changes to safely migrate */
const STORAGE_VERSION = 2;
const STORAGE_KEY = "precision_booking_v2";

/** Utility: safe number parsing */
const toMoney = (n) => {
  const num = Number(n);
  return Number.isFinite(num) ? num : 0;
};

/** Schema */
const DEFAULT_BOOKING = {
  version: STORAGE_VERSION,
  status: "idle", // "idle" | "in-progress"
  carType: "", // e.g. "sedan"
  services: [], // [{ id, title, price, ... , qty }]
  addons: [], // [{ id, title, price, ... , qty }]
  customerInfo: {}, // {name, phone, email,...}
  createdAt: null,
  updatedAt: null,
};

/** Context shape */
export const BookingContext = createContext({
  booking: DEFAULT_BOOKING,
  lastConfirmed: null, // snapshot after confirmation
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

const mergeWithDefault = (obj) => {
  const merged = { ...DEFAULT_BOOKING, ...(obj || {}) };
  // Normalize arrays & ensure qty >= 1
  merged.services = (merged.services || []).map((s) => ({
    ...s,
    id: s.id ?? s.title,
    qty: Math.max(1, Number(s.qty || 1)),
    price: toMoney(s.price),
  }));
  merged.addons = (merged.addons || []).map((a) => ({
    ...a,
    id: a.id ?? a.title,
    qty: Math.max(1, Number(a.qty || 1)),
    price: toMoney(a.price),
  }));
  return merged;
};

export const BookingProvider = ({ children }) => {
  // Rehydrate once (lazy init + defensive migrate)
  const [booking, setBookingState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return mergeWithDefault(DEFAULT_BOOKING);
      const parsed = JSON.parse(raw);

      if (!parsed || parsed.version !== STORAGE_VERSION) {
        // Old or corrupt storage — start fresh but keep carType if present
        const fresh = mergeWithDefault({
          carType: parsed?.carType || "",
          status: "idle",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }

      return mergeWithDefault(parsed);
    } catch {
      return mergeWithDefault(DEFAULT_BOOKING);
    }
  });

  // lastConfirmed - kept in memory to show immediate receipt after confirmation
  const [lastConfirmed, setLastConfirmed] = useState(null);

  // Debounced persist (prevents thrash on rapid +/− clicks)
  const persistTimer = useRef(null);
  const persist = useCallback((next) => {
    try {
      // Only persist drafts. We never persist confirmed state.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("BookingContext: failed to save localStorage", err);
    }
  }, []);

  useEffect(() => {
    // Small debounce to combine rapid updates
    if (persistTimer.current) clearTimeout(persistTimer.current);
    // If booking is null (shouldn't happen) skip
    persistTimer.current = setTimeout(() => {
      if (!booking) return;
      // If booking has been marked as a transient "CLEAR" sentinel, skip persistence
      // (we'll handle clearing explicitly in confirmBooking)
      persist(booking);
    }, 120);
    return () => clearTimeout(persistTimer.current);
  }, [booking, persist]);

  // Listen to storage events so other tabs/copies stay in sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) {
            // Other tab cleared storage — reset our state
            setBookingState(mergeWithDefault(DEFAULT_BOOKING));
            return;
          }
          const parsed = JSON.parse(raw);
          setBookingState(mergeWithDefault(parsed));
        } catch {
          setBookingState(mergeWithDefault(DEFAULT_BOOKING));
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setBooking = useCallback((updater) => {
    setBookingState((prev) => {
      const base =
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      const next = mergeWithDefault({
        ...base,
        version: STORAGE_VERSION,
        status: base.status || "in-progress", // treat any change as in-progress
        createdAt: prev.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return next;
    });
  }, []);

  const resetBooking = useCallback(() => {
    const fresh = mergeWithDefault({
      status: "idle",
      carType: "",
      services: [],
      addons: [],
      customerInfo: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setLastConfirmed(null);
    setBookingState(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
  }, []);

  /**
   * confirmBooking
   *
   * Call this AFTER your backend successfully created the booking.
   * - It will snapshot the confirmed booking to `lastConfirmed` (in memory).
   * - Remove the draft from localStorage so new users start fresh.
   * - Reset the `booking` context to an empty draft so Services page shows nothing.
   *
   * If you want to show a receipt after confirmation, read `lastConfirmed` from context.
   */
  const confirmBooking = useCallback(() => {
    setBookingState((prev) => {
      const snapshot = mergeWithDefault(prev);
      // Keep snapshot in memory so UI can render a receipt right away
      setLastConfirmed(snapshot);

      try {
        // Remove draft from storage so next user starts fresh
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      // Reset in-memory draft
      const fresh = mergeWithDefault({
        status: "idle",
        carType: "",
        services: [],
        addons: [],
        customerInfo: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return fresh;
    });
  }, []);

  // --- Mutators (toggle + qty controls) ---
  const upsertItem = (list, item, deltaQty = 0) => {
    const idx = list.findIndex((x) => x.id === (item.id ?? item.title));
    if (idx === -1) {
      return [
        ...list,
        { ...item, id: item.id ?? item.title, qty: Math.max(1, item.qty || 1) },
      ];
    }
    const next = [...list];
    const current = next[idx];
    const qty = Math.max(0, (current.qty || 1) + deltaQty);
    if (qty === 0) {
      next.splice(idx, 1);
    } else {
      next[idx] = { ...current, qty };
    }
    return next;
  };

  const toggleService = useCallback((service) => {
    setBookingState((prev) => {
      const exists = (prev.services || []).some(
        (s) => s.id === (service.id ?? service.title)
      );
      const nextServices = exists
        ? prev.services.filter((s) => s.id !== (service.id ?? service.title))
        : upsertItem(prev.services || [], {
            ...service,
            price: toMoney(service.price),
            qty: 1,
          });
      return mergeWithDefault({
        ...prev,
        services: nextServices,
        status: "in-progress",
        updatedAt: new Date().toISOString(),
      });
    });
  }, []);

  const toggleAddon = useCallback((addon) => {
    setBookingState((prev) => {
      const exists = (prev.addons || []).some(
        (a) => a.id === (addon.id ?? addon.title)
      );
      const nextAddons = exists
        ? prev.addons.filter((a) => a.id !== (addon.id ?? addon.title))
        : upsertItem(prev.addons || [], {
            ...addon,
            price: toMoney(addon.price),
            qty: 1,
          });
      return mergeWithDefault({
        ...prev,
        addons: nextAddons,
        status: "in-progress",
        updatedAt: new Date().toISOString(),
      });
    });
  }, []);

  const incrementService = useCallback((id) => {
    setBookingState((prev) => {
      const nextServices = upsertItem(prev.services || [], { id }, +1);
      return mergeWithDefault({
        ...prev,
        services: nextServices,
        status: "in-progress",
        updatedAt: new Date().toISOString(),
      });
    });
  }, []);

  const decrementService = useCallback((id) => {
    setBookingState((prev) => {
      const nextServices = upsertItem(prev.services || [], { id }, -1);
      return mergeWithDefault({
        ...prev,
        services: nextServices,
        status: "in-progress",
        updatedAt: new Date().toISOString(),
      });
    });
  }, []);

  const incrementAddon = useCallback((id) => {
    setBookingState((prev) => {
      const nextAddons = upsertItem(prev.addons || [], { id }, +1);
      return mergeWithDefault({
        ...prev,
        addons: nextAddons,
        status: "in-progress",
        updatedAt: new Date().toISOString(),
      });
    });
  }, []);

  const decrementAddon = useCallback((id) => {
    setBookingState((prev) => {
      const nextAddons = upsertItem(prev.addons || [], { id }, -1);
      return mergeWithDefault({
        ...prev,
        addons: nextAddons,
        status: "in-progress",
        updatedAt: new Date().toISOString(),
      });
    });
  }, []);

  // Derived total
  const totalPrice = useMemo(() => {
    const serviceTotal = (booking.services || []).reduce(
      (sum, s) => sum + toMoney(s.price) * Math.max(1, s.qty || 1),
      0
    );
    const addonTotal = (booking.addons || []).reduce(
      (sum, a) => sum + toMoney(a.price) * Math.max(1, a.qty || 1),
      0
    );
    return Number((serviceTotal + addonTotal).toFixed(2));
  }, [booking.services, booking.addons]);

  return (
    <BookingContext.Provider
      value={{
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
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
