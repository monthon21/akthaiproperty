export interface Agent {
  name: string;
  phone: string;
  email: string;
  line: string;
}

export interface Property {
  id: number | string;
  code?: string;
  id_string: string;
  title: string;
  projectName?: string;
  location: string;
  zipCode?: string;
  price: string;
  sellPrice?: string | null;
  rentPrice?: string | null;
  type: string; // "ขาย" | "เช่า"
  category: string; // "House" | "Condo" | "Villa"
  beds: number;
  baths: number;
  sqft: number;
  noFloor?: number;
  maidRoom?: number;
  parkingLot?: number;
  facing?: string;
  otherFeatures?: string;
  googleMap?: string;
  landSize?: number;
  usableArea?: number;
  image: string;
  description: string;
  facilities: string[];
  gallery: string[];
  agent: Agent;
  nearbyPlaces?: {
    placeName: string;
    distance?: string;
    travelTime?: string;
  }[];
}

export const featuredProperties: Property[] = [
  {
    id: 1,
    id_string: "AK-101",
    title: "บ้านเดี่ยว ศุภาลัย ปาล์มสปริงส์",
    location: "บางโจ, ภูเก็ต",
    price: "6,500,000",
    sellPrice: "6,500,000",
    rentPrice: null,
    type: "ขาย",
    category: "House",
    beds: 3,
    baths: 3,
    sqft: 180,
    image: "/house1.png",
    description: "โครงการบ้านเดี่ยวสุดหรูระดับพรีเมียม โอบล้อมด้วยธรรมชาติของบางโจ ภูเก็ต ตกแต่งด้วยวัสดุคุณภาพสูงและการออกแบบพื้นที่ใช้สอยที่คุ้มค่าทุกตารางนิ้ว เดินทางสะดวก ใกล้ห้างสรรพสินค้า โรงเรียนนานาชาติ และแหล่งท่องเที่ยวสำคัญ เหมาะสำหรับครอบครัวที่ต้องการความเป็นส่วนตัวและความร่มรื่น",
    facilities: [
      "ระบบรักษาความปลอดภัย 24 ชม.",
      "กล้อง CCTV ทั่วโครงการ",
      "สระว่ายน้ำส่วนกลางขนาดใหญ่",
      "ฟิตเนสพร้อมอุปกรณ์ครบครัน",
      "สวนสาธารณะและพื้นที่สีเขียว",
      "สนามเด็กเล่น"
    ],
    gallery: [
      "/house1.png",
      "/condo1.png",
      "/villa1.png"
    ],
    agent: {
      name: "สมเกียรติ ไทยแลนด์ดี",
      phone: "081-234-5678",
      email: "somkiat@akthaiproperty.com",
      line: "@akproperty"
    }
  },
  {
    id: 2,
    id_string: "AK-102",
    title: "คอนโดหรู เดอะ รีเวียร่า",
    location: "ทองหล่อ, กรุงเทพฯ",
    price: "45,000 / เดือน",
    sellPrice: null,
    rentPrice: "45,000",
    type: "เช่า",
    category: "Condo",
    beds: 2,
    baths: 2,
    sqft: 85,
    image: "/condo1.png",
    description: "คอนโดมิเนียมหรูใจกลางทองหล่อ วิวเมืองมุมสูงแบบพาโนรามา ตกแต่งครบครันด้วยเฟอร์นิเจอร์แบรนด์หรูพร้อมเข้าอยู่ มีลิฟต์ส่วนตัว พื้นที่ห้องรับแขกกว้างขวาง และสิ่งอำนวยความสะดวกระดับ 5 ดาว ตอบโจทย์การใช้ชีวิตระดับหรูสไตล์คนเมือง",
    facilities: [
      "สระว่ายน้ำลอยฟ้าแบบ Infinity Edge",
      "ห้องซาวน่าและสตรีม",
      "สกายเลานจ์และพื้นที่บาร์บีคิว",
      "ลิฟต์ส่วนตัว (Private Lift)",
      "สิทธิ์ที่จอดรถเฉพาะห้อง",
      "Access Card Control และระบบสแกนใบหน้า"
    ],
    gallery: [
      "/condo1.png",
      "/house1.png",
      "/villa1.png"
    ],
    agent: {
      name: "ศิริพร อารีย์เลิศ",
      phone: "089-876-5432",
      email: "siriporn@akthaiproperty.com",
      line: "@akproperty"
    }
  },
  {
    id: 3,
    id_string: "AK-103",
    title: "วิลล่าส่วนตัว บ่อผุด",
    location: "เกาะสมุย, สุราษฎร์ธานี",
    price: "18,900,000",
    sellPrice: "18,900,000",
    rentPrice: null,
    type: "ขาย",
    category: "Villa",
    beds: 4,
    baths: 5,
    sqft: 350,
    image: "/villa1.png",
    description: "พูลวิลล่าสไตล์โมเดิร์นทรอปิคอล ตั้งอยู่บนเนินเขาบ่อผุด สมุย มองเห็นวิวทะเลสวยสะกดใจแบบเต็มตา พร้อมสระว่ายน้ำส่วนตัวและลานกว้างสำหรับจัดปาร์ตี้ริมสระ ออกแบบให้มีความเปิดโล่งรับลมทะเลเย็นสบายตลอดปี เหมาะสำหรับการลงทุนเป็นบ้านพักตากอากาศพรีเมียมหรือเพื่อปล่อยเช่าระยะยาวสำหรับต่างชาติ",
    facilities: [
      "สระว่ายน้ำส่วนตัว (Private Pool)",
      "ระบบน้ำตกรอบสระ",
      "พื้นที่จัดปาร์ตี้กลางแจ้ง",
      "ระบบรักษาความปลอดภัยอัจฉริยะในบ้าน",
      "ที่จอดรถรองรับ 3 คัน",
      "อ่างอาบน้ำสไตล์จากุซซี่กลางแจ้ง"
    ],
    gallery: [
      "/villa1.png",
      "/house1.png",
      "/condo1.png"
    ],
    agent: {
      name: "นราธร สมุยโปร",
      phone: "087-654-3210",
      email: "narathorn@akthaiproperty.com",
      line: "@akproperty"
    }
  }
];
