import { isIndustrialType } from "./assetSpecs";

// ============================================================
// Amenities Master Config — สิ่งอำนวยความสะดวก
// ============================================================

export interface AmenityItem {
  key: string;
  label: string;      // ภาษาไทย
  labelEn: string;    // English
  labelZh: string;    // 中文 (Chinese)
}

export interface AmenityGroup {
  id: string;
  title: string;      // ภาษาไทย
  titleEn: string;    // English
  titleZh: string;    // 中文
  /** Which property group this amenity group applies to (default: "residential") */
  appliesTo?: "residential" | "industrial" | "all";
  items: AmenityItem[];
}

export const AMENITY_GROUPS: AmenityGroup[] = [
  {
    id: "indoor",
    title: "ภายในบ้าน / ยูนิต",
    titleEn: "Indoor",
    titleZh: "室内",
    items: [
      { key: "air_conditioning",  label: "เครื่องปรับอากาศ",         labelEn: "Air Conditioning",     labelZh: "空调" },
      { key: "water_heater",      label: "เครื่องทำน้ำอุ่น",         labelEn: "Water Heater",         labelZh: "热水器" },
      { key: "boiler",            label: "เครื่องทำน้ำร้อน (Boiler)", labelEn: "Boiler",              labelZh: "锅炉" },
      { key: "builtin_fridge",    label: "ตู้เย็นบิ้วท์อิน",         labelEn: "Built-in Refrigerator",labelZh: "嵌入式冰箱" },
      { key: "builtin_kitchen",   label: "เตาครัวบิ้วท์อิน",         labelEn: "Built-in Kitchen",     labelZh: "嵌入式厨房" },
      { key: "hood",              label: "เครื่องดูดควัน",            labelEn: "Range Hood",           labelZh: "抽油烟机" },
      { key: "builtin_wardrobe",  label: "ตู้เสื้อผ้าบิ้วท์อิน",      labelEn: "Built-in Wardrobe",    labelZh: "嵌入式衣柜" },
      { key: "curtains",          label: "ผ้าม่าน / มู่ลี่",          labelEn: "Curtains / Blinds",    labelZh: "窗帘 / 百叶窗" },
      { key: "washing_machine",   label: "เครื่องซักผ้า",             labelEn: "Washing Machine",      labelZh: "洗衣机" },
      { key: "smart_home",        label: "Smart Home System",         labelEn: "Smart Home System",    labelZh: "智能家居系统" },
      { key: "cctv_indoor",       label: "ระบบ CCTV ภายใน",          labelEn: "Indoor CCTV",          labelZh: "室内闭路电视" },
      { key: "private_lift",      label: "ลิฟต์ส่วนตัว",             labelEn: "Private Lift",         labelZh: "私人电梯" },
    ],
  },
  {
    id: "water",
    title: "พื้นที่น้ำ",
    titleEn: "Water Features",
    titleZh: "水上设施",
    items: [
      { key: "pool_private",   label: "สระว่ายน้ำส่วนตัว",     labelEn: "Private Pool",    labelZh: "私人泳池" },
      { key: "pool_common",    label: "สระว่ายน้ำส่วนกลาง",    labelEn: "Common Pool",     labelZh: "公共泳池" },
      { key: "jacuzzi",        label: "Jacuzzi / Hot Tub",      labelEn: "Jacuzzi / Hot Tub", labelZh: "按摩浴缸" },
      { key: "kids_pool",      label: "สระเด็ก",                labelEn: "Kids Pool",       labelZh: "儿童泳池" },
      { key: "bathtub",        label: "อ่างอาบน้ำแช่",          labelEn: "Bathtub",         labelZh: "浴缸" },
    ],
  },
  {
    id: "outdoor",
    title: "พื้นที่กลางแจ้ง",
    titleEn: "Outdoor",
    titleZh: "户外设施",
    items: [
      { key: "private_garden",    label: "สวนส่วนตัว",              labelEn: "Private Garden",     labelZh: "私人花园" },
      { key: "balcony",           label: "ระเบียง / Balcony",        labelEn: "Balcony",            labelZh: "阳台" },
      { key: "rooftop",           label: "Rooftop Terrace",          labelEn: "Rooftop Terrace",    labelZh: "屋顶露台" },
      { key: "bbq_area",          label: "BBQ Area",                 labelEn: "BBQ Area",           labelZh: "烧烤区" },
      { key: "sala",              label: "Sala / ศาลา",              labelEn: "Sala / Pavilion",    labelZh: "凉亭" },
      { key: "covered_parking",   label: "ที่จอดรถในร่ม",            labelEn: "Covered Parking",    labelZh: "室内停车场" },
      { key: "extra_parking",     label: "ที่จอดรถเพิ่มเติม",        labelEn: "Extra Parking",      labelZh: "额外停车位" },
    ],
  },
  {
    id: "energy",
    appliesTo: "all",
    title: "พลังงาน & เทคโนโลยี",
    titleEn: "Energy & Tech",
    titleZh: "能源与科技",
    items: [
      { key: "solar_panel",       label: "โซลาร์เซลล์",              labelEn: "Solar Panel",        labelZh: "太阳能电池板" },
      { key: "ev_charger",        label: "ที่ชาร์จรถไฟฟ้า",           labelEn: "EV Charger",         labelZh: "电动车充电桩" },
      { key: "battery_storage",   label: "แบตเตอรี่สำรองพลังงาน",     labelEn: "Battery Storage",    labelZh: "电池储能" },
      { key: "3phase_electric",   label: "มิเตอร์ไฟฟ้า 3 เฟส",        labelEn: "3-Phase Electric",   labelZh: "三相电" },
      { key: "fiber_optic",       label: "Fiber Optic Internet",       labelEn: "Fiber Optic",        labelZh: "光纤网络" },
      { key: "smart_meter",       label: "Smart Meter",                labelEn: "Smart Meter",        labelZh: "智能电表" },
    ],
  },
  {
    id: "security",
    appliesTo: "all",
    title: "ความปลอดภัย",
    titleEn: "Security",
    titleZh: "安全设施",
    items: [
      { key: "guard_24h",         label: "รปภ. 24 ชั่วโมง",           labelEn: "24-Hour Security",   labelZh: "24小时保安" },
      { key: "cctv_24h",          label: "ระบบ CCTV รอบโครงการ",      labelEn: "24-Hour CCTV",       labelZh: "24小时监控" },
      { key: "perimeter_fence",   label: "รั้วรอบขอบชิด",              labelEn: "Perimeter Fence",    labelZh: "围墙" },
      { key: "keycard",           label: "ระบบ Key Card / Fingerprint", labelEn: "Key Card / Fingerprint", labelZh: "门禁卡/指纹" },
      { key: "intercom",          label: "Intercom / Video Door Phone", labelEn: "Intercom",          labelZh: "对讲机/视频门铃" },
      { key: "fire_alarm",        label: "ระบบแจ้งเตือนไฟไหม้",        labelEn: "Fire Alarm",         labelZh: "火灾报警器" },
    ],
  },
  {
    id: "lifestyle",
    title: "สุขภาพ & ไลฟ์สไตล์",
    titleEn: "Health & Lifestyle",
    titleZh: "健康与生活方式",
    items: [
      { key: "gym",               label: "ฟิตเนส",                    labelEn: "Fitness Center",     labelZh: "健身房" },
      { key: "sauna",             label: "ห้อง Sauna / Steam",         labelEn: "Sauna / Steam",      labelZh: "桑拿/蒸汽房" },
      { key: "playground",        label: "สนามเด็กเล่น",               labelEn: "Playground",         labelZh: "游乐场" },
      { key: "sport_court",       label: "สนามกีฬา (Tennis/Basketball)", labelEn: "Sport Court",     labelZh: "运动场" },
      { key: "coworking",         label: "Co-Working Space",           labelEn: "Co-Working Space",   labelZh: "共享工作空间" },
      { key: "meeting_room",      label: "ห้องประชุม",                  labelEn: "Meeting Room",       labelZh: "会议室" },
      { key: "convenience_store", label: "ร้านสะดวกซื้อในโครงการ",     labelEn: "Convenience Store",  labelZh: "便利店" },
    ],
  },
  {
    id: "building",
    title: "อาคาร & ส่วนกลาง",
    titleEn: "Building & Common Areas",
    titleZh: "楼宇与公共区域",
    items: [
      { key: "lobby",             label: "ล็อบบี้ / ห้องรับรอง",         labelEn: "Lobby",              labelZh: "大堂" },
      { key: "elevator",          label: "ลิฟต์โดยสาร",                  labelEn: "Elevator",           labelZh: "电梯" },
      { key: "common_parking",    label: "ที่จอดรถส่วนกลาง",             labelEn: "Common Parking",     labelZh: "公共停车场" },
      { key: "near_transit",      label: "ใกล้รถไฟฟ้า BTS / MRT",        labelEn: "Near BTS / MRT",     labelZh: "近轻轨/地铁" },
      { key: "juristic_office",   label: "นิติบุคคลดูแล",                labelEn: "Juristic Office",    labelZh: "物业管理处" },
    ],
  },
  {
    id: "others",
    title: "อื่นๆ",
    titleEn: "Others",
    titleZh: "其他",
    items: [
      { key: "pet_friendly",      label: "Pet-Friendly",               labelEn: "Pet Friendly",       labelZh: "可养宠物" },
      { key: "pet_area",          label: "พื้นที่สำหรับสัตว์เลี้ยง",    labelEn: "Pet Area",           labelZh: "宠物区" },
      { key: "laundry_room",      label: "ห้องซักรีดส่วนกลาง",          labelEn: "Laundry Room",       labelZh: "公共洗衣房" },
      { key: "waste_system",      label: "ระบบกำจัดขยะ",               labelEn: "Waste Management",   labelZh: "垃圾处理系统" },
      { key: "storage_room",      label: "ที่เก็บของส่วนกลาง",          labelEn: "Storage Room",       labelZh: "公共储物间" },
      { key: "shuttle",           label: "รับส่งรถ Shuttle",            labelEn: "Shuttle Service",    labelZh: "穿梭巴士服务" },
    ],
  },
  {
    id: "industrial_structure",
    appliesTo: "industrial",
    title: "โครงสร้าง & การขนส่ง",
    titleEn: "Structure & Logistics",
    titleZh: "结构与物流",
    items: [
      { key: "loading_dock",      label: "Loading Dock",                 labelEn: "Loading Dock",          labelZh: "装卸平台" },
      { key: "dock_leveler",      label: "Dock Leveler",                 labelEn: "Dock Leveler",          labelZh: "装卸调节板" },
      { key: "loading_ramp",      label: "ทางลาดขึ้นลงสินค้า",            labelEn: "Loading Ramp",          labelZh: "装卸坡道" },
      { key: "no_center_column",  label: "ไม่มีเสากลาง (Clear Span)",      labelEn: "Clear Span (No Columns)", labelZh: "无中柱" },
      { key: "overhead_crane",    label: "เครนเหนือศีรษะ (Overhead Crane)", labelEn: "Overhead Crane",        labelZh: "桥式起重机" },
      { key: "mezzanine",         label: "ชั้นลอย (Mezzanine)",            labelEn: "Mezzanine",             labelZh: "夹层" },
      { key: "epoxy_floor",       label: "พื้นอีพ็อกซี่",                  labelEn: "Epoxy Floor",           labelZh: "环氧地坪" },
      { key: "roof_insulation",   label: "ฉนวนกันความร้อนหลังคา",         labelEn: "Roof Insulation",       labelZh: "屋顶隔热" },
      { key: "roof_ventilator",   label: "ระบบระบายอากาศหลังคา",          labelEn: "Roof Ventilation",      labelZh: "屋顶通风" },
      { key: "truck_yard",        label: "ลานจอด / กลับรถบรรทุก",          labelEn: "Truck Yard",            labelZh: "货车停车/掉头场" },
      { key: "weighbridge",       label: "เครื่องชั่งรถบรรทุก",             labelEn: "Weighbridge",           labelZh: "地磅" },
    ],
  },
  {
    id: "industrial_systems",
    appliesTo: "industrial",
    title: "ระบบ & ใบอนุญาต",
    titleEn: "Systems & Permits",
    titleZh: "系统与许可",
    items: [
      { key: "fire_sprinkler",    label: "ระบบสปริงเกอร์ดับเพลิง",         labelEn: "Fire Sprinkler",        labelZh: "消防喷淋系统" },
      { key: "fire_hydrant",      label: "หัวจ่ายน้ำดับเพลิง (Hydrant)",    labelEn: "Fire Hydrant",          labelZh: "消防栓" },
      { key: "own_transformer",   label: "หม้อแปลงไฟฟ้าแยก",               labelEn: "Dedicated Transformer", labelZh: "独立变压器" },
      { key: "wastewater_system", label: "ระบบบำบัดน้ำเสีย",               labelEn: "Wastewater Treatment",  labelZh: "污水处理系统" },
      { key: "factory_license",   label: "ขอใบ รง.4 ได้",                  labelEn: "Factory License (Ror Ngor 4) Available", labelZh: "可申请工厂执照" },
      { key: "industrial_estate", label: "อยู่ในนิคมอุตสาหกรรม",           labelEn: "In Industrial Estate",  labelZh: "位于工业园区" },
      { key: "free_zone",         label: "เขตปลอดอากร (Free Zone)",       labelEn: "Free Zone",             labelZh: "保税区" },
      { key: "boi_zone",          label: "ได้สิทธิ BOI",                   labelEn: "BOI Eligible",          labelZh: "可享BOI优惠" },
      { key: "office_in_building",label: "มีสำนักงานในอาคาร",              labelEn: "Built-in Office",       labelZh: "内设办公室" },
      { key: "staff_restroom",    label: "ห้องน้ำพนักงาน",                 labelEn: "Staff Restrooms",       labelZh: "员工洗手间" },
      { key: "canteen",           label: "โรงอาหาร / ห้องพักพนักงาน",      labelEn: "Canteen / Staff Room",  labelZh: "食堂/员工休息室" },
    ],
  },
];

// Flat map: key -> item (for quick lookup)
export const AMENITY_MAP: Record<string, AmenityItem> = Object.fromEntries(
  AMENITY_GROUPS.flatMap((g) => g.items.map((item) => [item.key, item]))
);

// Parse amenities JSON string from DB
export function parseAmenities(jsonStr: string | null | undefined): string[] {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Amenity groups that apply to the given AssetType */
export function getAmenityGroups(type: string | null | undefined): AmenityGroup[] {
  const industrial = isIndustrialType(type);
  return AMENITY_GROUPS.filter((g) => {
    const scope = g.appliesTo ?? "residential";
    return scope === "all" || scope === (industrial ? "industrial" : "residential");
  });
}
