import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  country: string;
  phoneCountryCode: string;
  phone: string;
  role: "CUSTOMER" | "ADMIN";
  isBlocked?: boolean;
  createdAt: string;
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  customerCountry: string;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  orderStatus: "PROCESSING" | "COMPLETED" | "CANCELLED";
  paymentMethod?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    productTitle: string;
    productSlug: string;
    currency: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }[];
}

export interface StoredDownload {
  id: string;
  orderId: string;
  orderNumber: string;
  userId?: string | null;
  productId: string;
  productTitle: string;
  productSlug: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  downloadToken: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string;
  isExpired: boolean;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const DOWNLOADS_FILE = path.join(DATA_DIR, "downloads.json");

function ensureDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error("Failed to ensure data dir:", e);
  }
}

// Memory caches
let usersCache: Map<string, StoredUser> | null = null;
let ordersCache: Map<string, StoredOrder> | null = null;
let downloadsCache: Map<string, StoredDownload> | null = null;

function loadUsers(): Map<string, StoredUser> {
  if (usersCache) return usersCache;
  usersCache = new Map();
  ensureDirectory();

  let dataLoaded = false;
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, "utf-8");
      const list: StoredUser[] = JSON.parse(content);
      list.forEach((u) => usersCache?.set(u.email.toLowerCase().trim(), u));
      dataLoaded = true;
    }
  } catch (err) {
    console.warn("Could not read users file, starting fresh:", err);
  }

  // Pre-seed default Admin if not exists
  const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || "theprintfactory2026@gmail.com").toLowerCase().trim();
  if (!usersCache.has(adminEmail)) {
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@ThePrintFactory2026!";
    const adminUser: StoredUser = {
      id: "usr_admin_default",
      name: "The Print Factory Administrator",
      email: adminEmail,
      passwordHash: bcrypt.hashSync(adminPassword, 10),
      country: "IN",
      phoneCountryCode: "+91",
      phone: "",
      role: "ADMIN",
      createdAt: new Date().toISOString(),
    };
    usersCache.set(adminEmail, adminUser);
    persistUsers();
  }

  return usersCache;
}

function persistUsers() {
  try {
    ensureDirectory();
    if (usersCache) {
      const list = Array.from(usersCache.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to persist users:", err);
  }
}

export function saveLocalDevUser(user: StoredUser): void {
  const cache = loadUsers();
  cache.set(user.email.toLowerCase().trim(), user);
  persistUsers();
}

export function getLocalDevUser(email: string): StoredUser | undefined {
  const cache = loadUsers();
  return cache.get(email.toLowerCase().trim());
}

export function getLocalDevUserById(id: string): StoredUser | undefined {
  const cache = loadUsers();
  const list = Array.from(cache.values());
  for (const u of list) {
    if (u.id === id) return u;
  }
  return undefined;
}

export function getAllLocalDevUsers(): StoredUser[] {
  const cache = loadUsers();
  return Array.from(cache.values());
}

// ---------------- ORDERS ----------------

function loadOrders(): Map<string, StoredOrder> {
  if (ordersCache) return ordersCache;
  ordersCache = new Map();
  ensureDirectory();

  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      const list: StoredOrder[] = JSON.parse(content);
      list.forEach((o) => {
        ordersCache?.set(o.id, o);
        ordersCache?.set(o.orderNumber, o);
      });
    }
  } catch (err) {
    console.warn("Could not read orders file, starting fresh:", err);
  }

  // Pre-seed mock demo orders if none exist
  if (ordersCache.size === 0) {
    const demoOrders: StoredOrder[] = [
      {
        id: "ord_demo_101",
        orderNumber: "STL-892144-129",
        userId: "c_1",
        customerName: "Marcus Aurelius",
        customerEmail: "marcus@rome.org",
        customerCountry: "IT",
        currency: "USD",
        subtotal: 14.99,
        discount: 0,
        tax: 0,
        total: 14.99,
        paymentStatus: "PAID",
        orderStatus: "COMPLETED",
        paymentMethod: "Razorpay Card",
        createdAt: new Date().toISOString(),
        items: [
          {
            id: "i_101_1",
            productId: "prod_01",
            productTitle: "Cyberpunk Ronin Collectible Bust",
            productSlug: "cyberpunk-ronin-bust",
            currency: "USD",
            unitPrice: 14.99,
            quantity: 1,
            total: 14.99,
          },
        ],
      },
      {
        id: "ord_demo_102",
        orderNumber: "STL-742911-884",
        userId: "c_2",
        customerName: "Priya Sundaram",
        customerEmail: "priya@chennai3d.in",
        customerCountry: "IN",
        currency: "INR",
        subtotal: 1299,
        discount: 0,
        tax: 0,
        total: 1299,
        paymentStatus: "PAID",
        orderStatus: "COMPLETED",
        paymentMethod: "UPI QR (Razorpay)",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        items: [
          {
            id: "i_102_1",
            productId: "prod_02",
            productTitle: "Planetary Gearbox Fidget Spinner Kit",
            productSlug: "planetary-gearbox-fidget-spinner",
            currency: "INR",
            unitPrice: 599,
            quantity: 1,
            total: 599,
          },
          {
            id: "i_102_2",
            productId: "prod_04",
            productTitle: "Low-Poly Geometric Planter Set",
            productSlug: "low-poly-geometric-planters",
            currency: "INR",
            unitPrice: 700,
            quantity: 1,
            total: 700,
          },
        ],
      },
      {
        id: "ord_demo_103",
        orderNumber: "STL-415890-332",
        userId: "c_3",
        customerName: "James Thorne",
        customerEmail: "jthorne@bristol.uk",
        customerCountry: "GB",
        currency: "GBP",
        subtotal: 10.99,
        discount: 0,
        tax: 0,
        total: 10.99,
        paymentStatus: "PAID",
        orderStatus: "COMPLETED",
        paymentMethod: "Razorpay Card",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        items: [
          {
            id: "i_103_1",
            productId: "prod_03",
            productTitle: "Modular Cable Management Spine",
            productSlug: "modular-cable-management-spine",
            currency: "GBP",
            unitPrice: 10.99,
            quantity: 1,
            total: 10.99,
          },
        ],
      },
    ];

    demoOrders.forEach((o) => {
      ordersCache?.set(o.id, o);
      ordersCache?.set(o.orderNumber, o);
    });
    persistOrders();
  }

  return ordersCache;
}

function persistOrders() {
  try {
    ensureDirectory();
    if (ordersCache) {
      // Use unique ids to avoid duplication from (id & orderNumber keys)
      const seen = new Set<string>();
      const list: StoredOrder[] = [];
      for (const o of Array.from(ordersCache.values())) {
        if (!seen.has(o.id)) {
          seen.add(o.id);
          list.push(o);
        }
      }
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to persist orders:", err);
  }
}

export function saveLocalDevOrder(order: StoredOrder): void {
  const cache = loadOrders();
  cache.set(order.id, order);
  cache.set(order.orderNumber, order);
  persistOrders();
}

export function getLocalDevOrder(idOrNumber: string): StoredOrder | undefined {
  const cache = loadOrders();
  return cache.get(idOrNumber);
}

export function getAllLocalDevOrders(): StoredOrder[] {
  const cache = loadOrders();
  const seen = new Set<string>();
  const list: StoredOrder[] = [];
  for (const o of Array.from(cache.values())) {
    if (!seen.has(o.id)) {
      seen.add(o.id);
      list.push(o);
    }
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getLocalDevOrdersByUser(userIdOrEmail: string): StoredOrder[] {
  const all = getAllLocalDevOrders();
  const clean = userIdOrEmail.toLowerCase().trim();
  return all.filter(
    (o) =>
      (o.userId && o.userId.toLowerCase() === clean) ||
      (o.customerEmail && o.customerEmail.toLowerCase().trim() === clean)
  );
}

// ---------------- DOWNLOADS ----------------

function loadDownloads(): Map<string, StoredDownload> {
  if (downloadsCache) return downloadsCache;
  downloadsCache = new Map();
  ensureDirectory();

  try {
    if (fs.existsSync(DOWNLOADS_FILE)) {
      const content = fs.readFileSync(DOWNLOADS_FILE, "utf-8");
      const list: StoredDownload[] = JSON.parse(content);
      list.forEach((d) => {
        downloadsCache?.set(d.id, d);
        downloadsCache?.set(d.downloadToken, d);
      });
    }
  } catch (err) {
    console.warn("Could not read downloads file:", err);
  }

  return downloadsCache;
}

function persistDownloads() {
  try {
    ensureDirectory();
    if (downloadsCache) {
      const seen = new Set<string>();
      const list: StoredDownload[] = [];
      for (const d of Array.from(downloadsCache.values())) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          list.push(d);
        }
      }
      fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(list, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to persist downloads:", err);
  }
}

export function saveLocalDevDownload(download: StoredDownload): void {
  const cache = loadDownloads();
  cache.set(download.id, download);
  cache.set(download.downloadToken, download);
  persistDownloads();
}

export function getLocalDevDownloadByToken(token: string): StoredDownload | undefined {
  const cache = loadDownloads();
  return cache.get(token);
}

export function getLocalDevDownloads(orderIdOrUserId: string): StoredDownload[] {
  const cache = loadDownloads();
  const seen = new Set<string>();
  const list: StoredDownload[] = [];
  for (const d of Array.from(cache.values())) {
    if (!seen.has(d.id)) {
      seen.add(d.id);
      if (d.orderId === orderIdOrUserId || d.userId === orderIdOrUserId) {
        list.push(d);
      }
    }
  }
  return list;
}
