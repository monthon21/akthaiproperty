"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface MapCoordinates {
  lat: number;
  lng: number;
  displayName?: string;
}

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coords: MapCoordinates, embedUrl: string) => void;
  initialValue?: string; // existing googleMap field value
}

function buildEmbedUrl(lat: number, lng: number): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}

function parseExistingCoords(value: string): { lat: number; lng: number } | null {
  if (!value) return null;
  // "13.7563, 100.5018" pattern
  const simple = value.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (simple) return { lat: parseFloat(simple[1]), lng: parseFloat(simple[2]) };
  // google maps URL q=lat,lng
  const urlMatch = value.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (urlMatch) return { lat: parseFloat(urlMatch[1]), lng: parseFloat(urlMatch[2]) };
  return null;
}

export default function MapPickerModal({ isOpen, onClose, onConfirm, initialValue }: MapPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<MapCoordinates | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "manual">("search");
  const [copySuccess, setCopySuccess] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for messages from the interactive map iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.type === 'MAP_CLICK') {
        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        setSelectedCoords({ lat, lng });
        setManualLat(lat.toFixed(6));
        setManualLng(lng.toFixed(6));
      } else if (data && data.type === 'MAP_READY') {
        if (selectedCoords) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'SET_LOCATION',
            lat: selectedCoords.lat,
            lng: selectedCoords.lng
          }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedCoords]);

  // Parse initial value when modal opens
  useEffect(() => {
    if (isOpen && initialValue) {
      const parsed = parseExistingCoords(initialValue);
      if (parsed) {
        setSelectedCoords({ lat: parsed.lat, lng: parsed.lng });
        setManualLat(parsed.lat.toString());
        setManualLng(parsed.lng.toString());
      }
    }
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen, initialValue]);

  // Debounced Nominatim search
  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchRef.current) clearTimeout(searchRef.current);
    if (q.trim().length < 3) { setSearchResults([]); return; }
    setIsSearching(true);
    searchRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=th&limit=6&accept-language=th`,
          { headers: { "Accept-Language": "th" } }
        );
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  }, []);

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedCoords({ lat, lng, displayName: result.display_name });
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
    setSearchResults([]);
    setSearchQuery(result.display_name?.split(",")[0] || "");
    iframeRef.current?.contentWindow?.postMessage({ type: 'SET_LOCATION', lat, lng }, '*');
  };

  const applyManual = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng)) return;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    setSelectedCoords({ lat, lng });
    iframeRef.current?.contentWindow?.postMessage({ type: 'SET_LOCATION', lat, lng }, '*');
  };

  const handleConfirm = () => {
    if (!selectedCoords) return;
    const embedUrl = buildEmbedUrl(selectedCoords.lat, selectedCoords.lng);
    onConfirm(selectedCoords, embedUrl);
    onClose();
  };

  const copyCoords = async () => {
    if (!selectedCoords) return;
    await navigator.clipboard.writeText(`${selectedCoords.lat}, ${selectedCoords.lng}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-[#0D1B2E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#112240]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">ตั้งค่าพิกัดโครงการ</h2>
              <p className="text-[10px] text-white/40">Set Project Coordinates — Powered by OpenStreetMap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

          {/* Left Panel — Search & Controls */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0D1B2E]">

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-4 pt-4">
              <button
                onClick={() => setActiveTab("search")}
                className={`flex-1 pb-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === "search" ? "text-accent border-accent" : "text-white/40 border-transparent hover:text-white/60"}`}
              >
                ค้นหาสถานที่
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`flex-1 pb-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === "manual" ? "text-accent border-accent" : "text-white/40 border-transparent hover:text-white/60"}`}
              >
                กรอกพิกัด
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === "search" ? (
                <>
                  {/* Search Input */}
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อสถานที่, ที่อยู่..."
                      value={searchQuery}
                      onChange={e => handleSearchChange(e.target.value)}
                      className="w-full h-10 bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 text-xs focus:outline-none focus:border-accent transition-all text-white placeholder:text-white/30"
                    />
                    {isSearching && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin w-3.5 h-3.5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Results */}
                  {searchResults.length > 0 && (
                    <ul className="space-y-1.5">
                      {searchResults.map((r, i) => (
                        <li key={i}>
                          <button
                            onClick={() => selectResult(r)}
                            className="w-full text-left px-3 py-2.5 bg-black/30 hover:bg-accent/10 border border-white/5 hover:border-accent/30 rounded-xl transition-all group"
                          >
                            <p className="text-xs font-semibold text-white group-hover:text-accent line-clamp-1 transition-colors">
                              {r.display_name?.split(",")[0]}
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5 line-clamp-2 leading-relaxed">
                              {r.display_name}
                            </p>
                            <p className="text-[9px] text-white/25 mt-1 font-mono">
                              {parseFloat(r.lat).toFixed(5)}, {parseFloat(r.lon).toFixed(5)}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {searchQuery.length >= 3 && !isSearching && searchResults.length === 0 && (
                    <p className="text-xs text-white/40 text-center py-4">ไม่พบสถานที่นี้ในประเทศไทย</p>
                  )}
                  {searchQuery.length === 0 && (
                    <div className="text-center py-6 space-y-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 mx-auto text-white/10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <p className="text-[10px] text-white/30 leading-relaxed">
                        พิมพ์ชื่อโครงการ, ถนน, หรือที่อยู่<br />เพื่อค้นหาพิกัดจากแผนที่
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Manual Coordinate Input */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      กรอก Latitude และ Longitude โดยตรง เช่น ค้นหาจาก Google Maps แล้ว copy พิกัดมา
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Latitude (ละติจูด)</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="e.g. 13.756331"
                        value={manualLat}
                        onChange={e => setManualLat(e.target.value)}
                        className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-accent transition-all text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Longitude (ลองจิจูด)</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="e.g. 100.501765"
                        value={manualLng}
                        onChange={e => setManualLng(e.target.value)}
                        className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs focus:outline-none focus:border-accent transition-all text-white font-mono"
                      />
                    </div>
                    <button
                      onClick={applyManual}
                      className="w-full h-10 bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
                    >
                      แสดงบนแผนที่
                    </button>
                    <div className="border-t border-white/5 pt-3">
                      <p className="text-[9px] text-white/25 leading-relaxed">
                        💡 วิธีหาพิกัดจาก Google Maps: คลิกขวาบนตำแหน่งที่ต้องการ → แล้ว copy พิกัดที่แสดง
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Selected Coords Display */}
            {selectedCoords && (
              <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold text-accent uppercase tracking-widest">พิกัดที่เลือก</p>
                  <button
                    onClick={copyCoords}
                    className="text-[9px] font-bold text-white/40 hover:text-accent transition-colors flex items-center gap-1"
                  >
                    {copySuccess ? (
                      <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 text-accent"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg> Copied!</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg> Copy</>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono text-white bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                  {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel — Map Preview */}
          <div className="flex-1 flex flex-col min-h-[300px] lg:min-h-0">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-[#112240]/50 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] text-white/50 font-medium">
                {selectedCoords
                  ? `แผนที่ — ${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)}`
                  : "แผนที่ประเทศไทย — ค้นหาหรือกรอกพิกัดเพื่อแสดงตำแหน่ง"}
              </span>
              {selectedCoords && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedCoords.lat}&mlon=${selectedCoords.lng}#map=16/${selectedCoords.lat}/${selectedCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-[9px] font-bold text-white/30 hover:text-accent transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  เปิดใน OSM
                </a>
              )}
            </div>
            <div className="flex-1 relative bg-black/20">
              <iframe
                ref={iframeRef}
                src="/map.html"
                width="100%"
                height="100%"
                className="w-full h-full border-0 grayscale-[20%]"
                loading="lazy"
                title="Interactive Map Picker"
              />
              {!selectedCoords && (
                <div className="absolute inset-x-0 bottom-6 flex items-end justify-center pointer-events-none">
                  <div className="bg-accent text-primary-dark font-bold shadow-lg shadow-accent/20 rounded-xl px-5 py-3 text-center animate-bounce">
                    <p className="text-xs">คลิกบนแผนที่เพื่อปักหมุดพิกัด 📌</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#112240]/60 shrink-0">
          <div className="text-[10px] text-white/30 leading-relaxed">
            {selectedCoords ? (
              <span className="text-white/50">
                ✓ พิกัดพร้อมใช้งาน — จะสร้าง embed URL สำหรับแผนที่โดยอัตโนมัติ
              </span>
            ) : (
              "ค้นหาสถานที่หรือกรอกพิกัดด้านซ้าย เพื่อยืนยันตำแหน่งโครงการ"
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 h-9 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedCoords}
              className="px-6 h-9 text-xs font-black uppercase tracking-widest bg-accent hover:bg-accent/90 text-primary-dark rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent/10"
            >
              ยืนยันพิกัด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
