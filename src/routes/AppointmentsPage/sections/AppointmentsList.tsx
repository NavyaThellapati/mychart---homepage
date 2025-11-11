// src/routes/appointments/appointments-list.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import authService from "../../../services/authService";

// ---------- Helpers ----------
function formatDateTime(dt?: string) {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// "1:45 PM" -> "13:45"
function to24h(h12: string | undefined) {
  if (!h12) return "00:00";
  const [time, mer] = h12.trim().split(" ");
  if (!time) return "00:00";
  let [hStr, mStr = "00"] = time.split(":");
  let h = Number(hStr);
  const pm = (mer || "").toUpperCase() === "PM";
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(mStr).padStart(2, "0")}`;
}

// Prefer startISO; else build from date+time; else fall back to datetime
function coerceISO(a: any): string | undefined {
  if (a.startISO) return a.startISO as string;
  if (a.datetime) return a.datetime as string;
  if (a.date) return `${a.date}T${to24h(a.time)}:00`;
  return undefined;
}

// "Pulmonology – Dr. John Miller" / "Pulmonology - Dr. John Miller"
function splitDoctor(deptDoctor: string | undefined) {
  const text = (deptDoctor || "").replace("—", "–"); // normalize em dash to en dash
  const parts = text.split(/–|-/); // en dash or hyphen
  if (parts.length >= 2) {
    return {
      specialty: parts[0].trim(),
      doctor: parts.slice(1).join("-").replace(/^Dr\.\s*/i, "Dr. ").trim(),
    };
  }
  return { specialty: "", doctor: deptDoctor || "" };
}

// ---------- Types ----------
interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  datetime: string; // ISO
  status: "Upcoming" | "Attended" | "Did not show up" | "Cancelled";
  type?: string;
  reason?: string;
  notes?: string;
}

// ---------- Component ----------
export function AppointmentsList(): JSX.Element {
  const navigate = useNavigate();
  const { search } = useLocation();

  const tabParam = new URLSearchParams(search).get("tab") as
    | "upcoming"
    | "past"
    | "canceled"
    | null;

  const [tab, setTab] = useState<"upcoming" | "past" | "canceled">(tabParam || "upcoming");
  const [data, setData] = useState<{ upcoming: Appointment[]; past: Appointment[]; canceled: Appointment[] }>({
    upcoming: [],
    past: [],
    canceled: [],
  });

  const loadForUser = useCallback(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }
    const key = `appointments::${user.id}`;
    const stored: any[] = JSON.parse(localStorage.getItem(key) || "[]");

    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    const canceled: Appointment[] = [];

    stored.forEach((raw) => {
      const { specialty, doctor } = splitDoctor(raw.doctor || raw.departmentDoctor);
      const iso = coerceISO(raw);
      if (!iso) return;

      const item: Appointment = {
        id: raw.id,
        doctor: raw.doctor || doctor,
        specialty: raw.specialty || specialty,
        datetime: iso,
        status: raw.status || "Upcoming",
        type: raw.type,
        reason: raw.reason,
        notes: raw.notes,
      };

      const t = new Date(item.datetime).getTime();
      const isFuture = !isNaN(t) && t >= Date.now();

      if (item.status === "Cancelled") canceled.push(item);
      else if (item.status === "Attended" || item.status === "Did not show up" || !isFuture) past.push(item);
      else upcoming.push(item);
    });

    // sort
    upcoming.sort((a, b) => +new Date(a.datetime) - +new Date(b.datetime));
    past.sort((a, b) => +new Date(b.datetime) - +new Date(a.datetime));
    canceled.sort((a, b) => +new Date(b.datetime) - +new Date(a.datetime));

    setData({ upcoming, past, canceled });
  }, [navigate]);

  // initial + whenever tab param changes
  useEffect(() => {
    loadForUser();
  }, [loadForUser]);

  // refresh when returning from details/cancel (focus) or when other tabs change storage
  useEffect(() => {
    const onFocus = () => loadForUser();
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("appointments::")) loadForUser();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadForUser]);

  // keep URL param in sync when switching tabs
  useEffect(() => {
    const params = new URLSearchParams(search);
    params.set("tab", tab);
    const newUrl = `/appointments?${params.toString()}`;
    // replace without navigation flicker
    window.history.replaceState(null, "", newUrl);
  }, [tab, search]);

  const list = useMemo(() => data[tab], [data, tab]);

  return (
    <section className="w-full">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 flex gap-8 text-lg">
        {(["upcoming", "past", "canceled"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 -mb-px font-semibold transition-colors ${
              tab === t ? "text-[#1E88E5] border-b-2 border-[#1E88E5]" : "text-gray-600 hover:text-[#1E88E5]"
            }`}
            type="button"
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-5">
        {list.map((appt) => (
          <Card key={appt.id} className="rounded-2xl border border-gray-200 shadow-md bg-white/95 backdrop-blur">
            <CardContent className="p-6 flex items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {appt.doctor}{appt.specialty ? ` - ${appt.specialty}` : ""}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{formatDateTime(appt.datetime)}</p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
                    appt.status === "Upcoming"
                      ? "text-[#1E88E5] bg-[#E7F1FF]"
                      : appt.status === "Attended"
                      ? "text-green-600 bg-green-50"
                      : appt.status === "Cancelled"
                      ? "text-red-600 bg-red-50"
                      : "text-orange-600 bg-orange-50"
                  }`}
                >
                  {appt.status}
                </span>
                <Button
                  className="px-5 py-2 rounded-full bg-[#1E88E5] text-white font-semibold shadow hover:bg-blue-600"
                  onClick={() => navigate(`/appointments/${appt.id}`)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {list.length === 0 && (
          <div className="text-center py-16 text-gray-500">No {tab} appointments.</div>
        )}
      </div>
    </section>
  );
}
