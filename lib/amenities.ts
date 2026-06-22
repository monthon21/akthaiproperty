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
