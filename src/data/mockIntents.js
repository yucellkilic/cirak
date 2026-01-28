export const mockIntents = [
  {
    intent_id: "pricing_corporate",
    intent_title: "Kurumsal Site Fiyatı",
    intent_keywords: [
      "fiyat", "fiyatlar", "ücret", "ücreti", "kaç tl", "ne kadar", "kaça yapılır",
      "site kaça", "site fiyatı", "web sitesi fiyatı", "kurumsal site fiyatı",
      "site maliyeti", "maliyet", "bütçe", "fiyat bilgisi", "ortalama fiyat",
      "en ucuz", "paket fiyat", "site yaptırmak ne kadar"
    ],
    primary_response: "Kurumsal web sitesi projeleri genellikle 5.900 TL – 25.000 TL aralığında planlanır.\nFiyat, ihtiyaçlara ve proje kapsamına göre netleşir.",
    secondary_response: "Fiyatı belirleyen ana etkenler; sayfa sayısı, özel fonksiyonlar ve içerik yönetim sistemi ihtiyaçlarıdır.",
    cta_response: "Detaylı bütçe teklifi için bizimle iletişime geçebilirsiniz.",
    tone: "kurumsal"
  },
  {
    intent_id: "delivery_time",
    intent_title: "Teslim Süresi",
    intent_keywords: [
      "teslim", "teslim süresi", "kaç günde", "kaç gün", "ne kadar sürer",
      "ne zaman biter", "hazır olur", "bitme süresi", "süre", "kaç haftada"
    ],
    primary_response: "Kurumsal web siteleri genellikle 7–14 gün içinde tamamlanır.\nSüre, proje kapsamına göre değişiklik gösterebilir.",
    secondary_response: "İçeriklerin tarafımıza hızlı iletilmesi süreci hızlandıran en önemli faktördür.",
    tone: "nötr"
  },
  {
    intent_id: "included_services",
    intent_title: "Neler Dahil?",
    intent_keywords: [
      "neler dahil", "fiyata ne dahil", "içinde ne var", "paket içeriği",
      "site içeriği", "sitede neler var", "sitede ne oluyor", "site özellikleri",
      "hangi özellikler var", "neler yapıyorsunuz", "neler sunuyorsunuz", "site fonksiyonları"
    ],
    primary_response: "Kurumsal web sitesinde; modern tasarım, mobil uyumlu yapı, temel SEO ayarları ve iletişim bölümleri yer alır.",
    secondary_response: "Tüm sistemlerimiz yönetim panelli olup, içeriklerinizi kendiniz güncelleyebilirsiniz.",
    tone: "kurumsal"
  },
  {
    intent_id: "process_flow",
    intent_title: "Süreç Nasıl İşliyor?",
    intent_keywords: [
      "süreç", "nasıl ilerliyor", "nasıl oluyor", "aşamalar", "baştan sona",
      "çalışma şekli", "işleyiş", "nasıl yapıyorsunuz", "tasarım süreci"
    ],
    primary_response: "Süreç; ihtiyaç analizi, tasarım, geliştirme, test ve yayına alma adımlarından oluşur.",
    secondary_response: "Her aşamada sizden onay alarak ilerliyor ve şeffaf bir çalışma süreci sunuyoruz.",
    tone: "güven"
  },
  {
    intent_id: "contact_info",
    intent_title: "İletişim / Ulaşım",
    intent_keywords: [
      "iletişim", "ulaşmak", "size nasıl ulaşırım", "numara", "telefon",
      "whatsapp", "mail", "e-posta", "instagram", "dm", "adres"
    ],
    primary_response: "Bize info@yucelkilic.tr e-posta adresinden veya +90 505 519 63 00 numaralı telefon / WhatsApp hattımızdan ulaşabilirsiniz.",
    secondary_response: "Sorularınız için günün her saati bize mesaj bırakabilirsiniz.",
    cta_response: "WhatsApp ile Hemen Bağlan",
    tone: "satış"
  },
  {
    intent_id: "general_web_info",
    intent_title: "Web Sitesi Nedir?",
    intent_keywords: [
      "web sitesi nedir", "kurumsal site ne işe yarar", "neden site gerekli",
      "site lazım mı", "site önemli mi", "yaptırmak mantıklı mı", "site şart mı"
    ],
    primary_response: "Kurumsal web siteleri, işletmenin dijitalde güvenilir görünmesini sağlar ve müşterilere net bilgi sunar.",
    secondary_response: "Profesyonel bir site, markanızın 7/24 açık olan dijital ofisidir.",
    tone: "nötr"
  },
  {
    intent_id: "site_continuity",
    intent_title: "Site Kapanır mı?",
    intent_keywords: [
      "site kapanır mı", "sonradan kapanır mı", "site silinir mi", "site sürekli açık mı",
      "site yayından düşer mi", "kapanma olur mu", "hosting bitince ne olur",
      "domain bitince ne olur", "site durur mu", "siteyi yaptıktan sonra kapanır mı",
      "site açık kalır mı", "site iptal olur mu", "site ömrü var mı", "site kalıcı mı",
      "her sene ödeme var mı", "kapanır", "silinir", "biter", "düşer", "hosting", "domain"
    ],
    primary_response: "Web sitesi kurulduktan sonra, hosting ve domain ücretleri yıllık olarak ödendiği sürece siteniz yayında kalır.",
    secondary_response: "Hosting ve domain, sitenin internette erişilebilir olmasını sağlayan temel hizmetlerdir. Süresi dolmadan yenilendiğinde site kesintisiz şekilde çalışmaya devam eder.",
    tone: "güven"
  }
];

export const widgetConfig = {
  name: "ÇIRAK",
  tagline: "Çırak’tan bilgi alın",
  welcomeMessage: "Merhaba, Çırak burada. Size nasıl yardımcı olabilirim?",
  fallbackResponse: "Bu konuda size en doğru bilgiyi sunabilmem için lütfen mesajınızı biraz daha netleştirir misiniz?"
};
