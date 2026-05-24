import { useMemo, useState, useEffect, useRef } from "react";
import {
  Row, Col, Typography, Card, Space, Tag, Spin, Empty,
  Divider, Button, Input, InputNumber, Switch, Badge,
  notification, Progress, Modal, Steps, Form, Slider,
} from "antd";
import {
  CalendarOutlined, FolderOpenOutlined, UserOutlined,
  ArrowLeftOutlined, FilePdfOutlined,
  CheckCircleOutlined, RocketOutlined, PlusOutlined,
  SearchOutlined, CloseOutlined, AppstoreOutlined,
  CodeOutlined, DatabaseOutlined, MobileOutlined,
  ExperimentOutlined, DeploymentUnitOutlined, SafetyOutlined,
  TeamOutlined, BookOutlined, SettingOutlined,
  LoadingOutlined, ThunderboltOutlined, MedicineBoxOutlined, HeartOutlined,
  CloudOutlined, StarOutlined, ControlOutlined, BulbOutlined,
  SmileOutlined, AlertOutlined, ToolOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import SelectableTagGroup from "../components/SelectableTagGroup";
import LoginNavbar from "../components/LoginNavbar";
import {
  useLastRun, useAnalysisById, useAnalysisFiles, useRunAnalysis, useCloneAnalysis, useExtractJob,
} from "../requests/AnalysisQueries";

const { Title, Text, Paragraph } = Typography;

// ── Sabit veriler ─────────────────────────────────────────────────────────────

const CATEGORY_LIST = [
  { key: "frontend",  label: "Frontend",        color: "#4F46E5", icon: <CodeOutlined /> },
  { key: "backend",   label: "Backend",          color: "#0F766E", icon: <DatabaseOutlined /> },
  { key: "mobile",    label: "Mobile",           color: "#EA580C", icon: <MobileOutlined /> },
  { key: "data-ai",   label: "Data / AI",        color: "#7C3AED", icon: <ExperimentOutlined /> },
  { key: "devops",    label: "DevOps",           color: "#2563EB", icon: <DeploymentUnitOutlined /> },
  { key: "security",  label: "Security",         color: "#DC2626", icon: <SafetyOutlined /> },
  { key: "cloud",     label: "Bulut Mimarisi",   color: "#0284C7", icon: <CloudOutlined /> },
  { key: "game-dev",  label: "Oyun Geliştirme",  color: "#9333EA", icon: <StarOutlined /> },
  { key: "embedded",  label: "Gömülü / IoT",     color: "#64748B", icon: <ControlOutlined /> },
  { key: "ui-ux",     label: "UI / UX Tasarım",  color: "#F59E0B", icon: <BulbOutlined /> },
];

const TECHNOLOGY_MAP = {
  frontend: [
    "JavaScript","TypeScript","React","Next.js","Vue.js","Nuxt.js","Angular",
    "Svelte","SvelteKit","Solid.js","Astro","Qwik",
    "HTML","CSS","Sass","LESS","Tailwind CSS","Bootstrap","Ant Design","Material UI","Chakra UI","shadcn/ui",
    "Redux","Zustand","Pinia","Recoil","Jotai","React Query","SWR",
    "Webpack","Vite","Parcel","Rollup","esbuild",
    "Three.js","WebGL","D3.js","GSAP","Framer Motion",
    "Storybook","Cypress","Playwright","Vitest","Jest","Testing Library",
    "jQuery","Alpine.js","HTMX",
  ],
  backend: [
    "Java","Spring Boot","Spring Security","Spring Data","Kotlin","Ktor",
    "C#",".NET","ASP.NET Core","Entity Framework",
    "Node.js","Express.js","NestJS","Fastify","Bun","Deno",
    "Python","Django","FastAPI","Flask","SQLAlchemy",
    "PHP","Laravel","Symfony","Composer",
    "Go","Gin","Echo","Fiber",
    "Ruby","Ruby on Rails","Sinatra",
    "Rust","Actix","Axum","Tokio",
    "Scala","Akka","Play Framework","Elixir","Phoenix","Haskell",
    "REST API","GraphQL","gRPC","WebSocket","Socket.IO","tRPC","OpenAPI",
    "Microservices","Event-Driven","Domain-Driven Design","CQRS","Event Sourcing",
    "MySQL","PostgreSQL","MS SQL Server","Oracle","MongoDB","Redis","Cassandra",
    "SQLite","DynamoDB","Firestore","CouchDB","Neo4j","InfluxDB","TimescaleDB",
    "Elasticsearch","OpenSearch","RabbitMQ","Apache Kafka","NATS",
    "Hibernate","Prisma","TypeORM","Drizzle ORM",
    "JWT","OAuth2","OpenID Connect","Keycloak",
  ],
  mobile: [
    "Java","Kotlin","Jetpack Compose","Android","Room","Retrofit","WorkManager",
    "Swift","SwiftUI","UIKit","Objective-C","iOS","Core Data","Combine",
    "Dart","Flutter","Provider","Riverpod","Bloc",
    "React Native","Expo","Reanimated",
    "Kotlin Multiplatform (KMM)","Capacitor","Ionic","Xamarin","MAUI",
    "Firebase","OneSignal","RevenueCat","Amplitude",
    "WearOS","tvOS","watchOS","CarPlay",
    "MVVM","MVI","Clean Architecture",
  ],
  "data-ai": [
    "Python","R","Julia","MATLAB","Scala",
    "Pandas","NumPy","Polars","Scikit-learn","XGBoost","LightGBM","CatBoost",
    "TensorFlow","PyTorch","Keras","JAX","Flax",
    "OpenCV","NLP","Transformers","BERT","GPT","LLM","RAG",
    "LangChain","LlamaIndex","LangGraph","CrewAI",
    "Hugging Face","Ollama","Vertex AI","Claude API","OpenAI API",
    "Chroma","Pinecone","Weaviate","Milvus","Qdrant",
    "Stable Diffusion","Whisper","ElevenLabs",
    "Matplotlib","Seaborn","Plotly","Bokeh","Altair",
    "Jupyter","VS Code","Google Colab","Kaggle",
    "Apache Spark","Hadoop","Flink","Databricks","Snowflake","dbt",
    "Airflow","Prefect","Dagster","Luigi","MLflow","DVC","W&B","Optuna",
    "ONNX","TensorRT","BentoML","Ray","FastAPI (serving)",
    "Power BI","Tableau","Looker","Metabase","Superset",
    "SQL","BigQuery","Redshift","ClickHouse","DuckDB",
    "Great Expectations","dbt","Data Lineage","Feature Engineering",
  ],
  devops: [
    "Docker","Docker Compose","Kubernetes","Helm","ArgoCD","Flux",
    "Linux","Bash","Shell Scripting","PowerShell","Makefile",
    "AWS","Azure","GCP","DigitalOcean","Hetzner",
    "Terraform","Pulumi","AWS CDK","Ansible","Chef","Puppet","SaltStack",
    "Jenkins","GitHub Actions","GitLab CI","CircleCI","Drone CI","Tekton",
    "CI/CD","GitOps","Infrastructure as Code","SRE",
    "Nginx","Apache","Caddy","HAProxy","Traefik",
    "Istio","Linkerd","Service Mesh","Consul",
    "Prometheus","Grafana","Alertmanager","Thanos","VictoriaMetrics",
    "Datadog","New Relic","Dynatrace","Elastic APM",
    "ELK Stack","Loki","Jaeger","OpenTelemetry","Zipkin",
    "Vault","Cert-Manager","SOPS","External Secrets",
    "Chaos Engineering","Load Testing","k6","Locust",
  ],
  security: [
    "Python","Bash","C","C++","Go","Rust",
    "Cyber Security","Network Security","Application Security","Cloud Security",
    "OWASP","OWASP Top 10","OWASP SAMM","CWE","CVE",
    "Penetration Testing","Red Team","Blue Team","Purple Team",
    "Burp Suite","Wireshark","Kali Linux","Nmap","Metasploit","Cobalt Strike",
    "SIEM","SOC","Splunk","IBM QRadar","Microsoft Sentinel",
    "Snort","Suricata","Zeek","IDS/IPS","SOAR","EDR","XDR",
    "PKI","Zero Trust","IAM","PAM","MFA","SSO",
    "SAST","DAST","SCA","Code Review","Threat Modeling","STRIDE",
    "Incident Response","Digital Forensics","Malware Analysis","Reverse Engineering",
    "GDPR","SOC 2","PCI DSS","HIPAA","ISO 27001","NIST","CIS Benchmarks",
    "CEH","OSCP","CISSP","CompTIA Security+","GPEN","GCIH",
    "Bug Bounty","CTF","Vulnerability Management",
  ],
  cloud: [
    "AWS","Azure","GCP","Alibaba Cloud","Oracle Cloud",
    "EC2","ECS","EKS","Lambda","Fargate","App Runner",
    "S3","EBS","EFS","Glacier","CloudFront","Route 53",
    "RDS","Aurora","DynamoDB","ElastiCache","DocumentDB","Redshift",
    "VPC","Subnet","Security Group","NAT Gateway","Load Balancer","API Gateway",
    "IAM","Cognito","KMS","WAF","Shield","GuardDuty",
    "CloudFormation","SAM","AWS CDK","Terraform","Pulumi",
    "CloudWatch","CloudTrail","X-Ray","Cost Explorer",
    "Azure VM","Azure Functions","Azure App Service","Azure Kubernetes Service",
    "Azure DevOps","Azure Blob Storage","Azure SQL","Cosmos DB",
    "Azure AD","Azure Key Vault","Azure Monitor","Bicep","ARM Templates",
    "GCP Compute Engine","Cloud Functions","GKE","Cloud Run","Cloud Storage",
    "BigQuery","Spanner","Firestore","Pub/Sub","Cloud Composer",
    "Multi-Cloud","Hybrid Cloud","FinOps","Cloud Architecture","Well-Architected",
    "Service Mesh","Event-Driven Architecture","Serverless",
  ],
  "game-dev": [
    "Unity","Unity DOTS","C#","Shader Graph","Unity Netcode",
    "Unreal Engine","Blueprints","C++","Lumen","Nanite",
    "Godot","GDScript","Godot 4",
    "GameMaker Studio","GML",
    "OpenGL","Vulkan","DirectX","Metal","WebGL",
    "PhysX","Bullet Physics","Box2D","Havok",
    "Game Design","Level Design","Game Mechanics","Balancing",
    "3D Modeling","Blender","Maya","3ds Max","ZBrush",
    "2D Art","Aseprite","Spine","Texture Atlas",
    "Multiplayer Networking","Photon","Mirror","Steam SDK","Epic Online Services",
    "Game Analytics","Firebase","Amplitude","AppsFlyer",
    "In-App Purchase","Ad Monetization","Game Economy",
    "Procedural Generation","AI/Pathfinding","A*","NavMesh","Behavior Trees",
    "VR Development","AR Development","Meta SDK","ARCore","ARKit",
    "Audio Design","FMOD","Wwise",
  ],
  embedded: [
    "C","C++","Embedded C","Rust (Embedded)","Python (MicroPython)","Ada",
    "ARM Cortex-M","ARM Cortex-A","RISC-V","PIC","AVR","MIPS",
    "Arduino","Raspberry Pi","STM32","ESP32","ESP8266","Nordic nRF",
    "FreeRTOS","Zephyr RTOS","RTEMS","VxWorks","QNX","Embedded Linux",
    "Yocto Project","Buildroot","OpenWRT","U-Boot",
    "I2C","SPI","UART","CAN Bus","RS-485","USB","Ethernet","Wi-Fi","BLE","LoRa","Zigbee",
    "MQTT","CoAP","Modbus","OPC-UA","PROFIBUS","EtherCAT",
    "JTAG","SWD","GDB","OpenOCD","Logic Analyzer","Oscilloscope",
    "Hardware Design","PCB Design","KiCad","Altium Designer","Eagle",
    "FPGA","VHDL","Verilog","Xilinx","Altera (Intel)",
    "IoT Platform","AWS IoT","Azure IoT Hub","Google Cloud IoT",
    "Digital Signal Processing","RTOS Scheduling","DMA","Interrupt Handling",
    "Bootloader","OTA Update","Power Management","Low Power Design",
    "Functional Safety","IEC 61508","ISO 26262","MISRA C",
  ],
  "ui-ux": [
    "Figma","Adobe XD","Sketch","InVision","Zeplin","Framer","Protopie","Principle",
    "User Research","Usability Testing","A/B Testing","Eye Tracking","Card Sorting",
    "Information Architecture","User Flow","Wireframing","Prototyping","Mockup",
    "Design Systems","Design Tokens","Component Library","Style Guide","Brand Identity",
    "Interaction Design","Motion Design","Micro-interactions","Animation",
    "Accessibility (WCAG)","Color Theory","Typography","Grid System","Gestalt",
    "UX Writing","Microcopy","Content Strategy","Localization",
    "Persona","Empathy Map","Journey Map","Service Blueprint","Storyboarding",
    "Heuristic Evaluation","Cognitive Walkthrough","Guerrilla Testing",
    "Adobe Illustrator","Adobe Photoshop","Adobe After Effects","Lottie",
    "HTML/CSS (temel)","Webflow","Framer Sites",
    "Product Thinking","Lean UX","Design Thinking","Agile UX","Jobs to Be Done",
    "Mobile Design","Responsive Design","Adaptive Design","Dark Mode","Theming",
  ],
};

const SOFT_SKILL_OPTIONS = [
  "Takım Çalışması","İletişim","Liderlik","Problem Çözme","Analitik Düşünme",
  "Zaman Yönetimi","Sorumluluk","Uyum Sağlama","Proaktif","Agile / Scrum",
  "Eleştirel Düşünme","Yaratıcılık","Hızlı Öğrenme","Müşteri Odaklılık",
  "Dikkat ve Titizlik","Mentorluk","Sunum Becerileri","Bağımsız Çalışma",
];

const EDUCATION_OPTIONS = [
  "Bilgisayar Mühendisliği","Yazılım Mühendisliği","Bilgisayar Bilimleri",
  "Yapay Zeka ve Veri Mühendisliği","Siber Güvenlik Mühendisliği",
  "Elektrik-Elektronik Mühendisliği","Elektronik ve Haberleşme Mühendisliği",
  "Kontrol ve Otomasyon Mühendisliği","Mekatronik Mühendisliği",
  "Bilişim Sistemleri Mühendisliği","Yönetim Bilişim Sistemleri",
  "Endüstri Mühendisliği","Makine Mühendisliği","İnşaat Mühendisliği",
  "Matematik","İstatistik","Fizik",
  "Grafik Tasarım","İletişim Tasarımı","Görsel İletişim Tasarımı",
  "İşletme (Teknoloji Odaklı)","Ziraat Mühendisliği",
];

// ── Sağlık Sektörü Sabitleri ──────────────────────────────────────────────────

const HEALTH_CATEGORY_LIST = [
  { key: "klinik-hekim",    label: "Klinik Hekim",        color: "#DC2626", icon: <MedicineBoxOutlined /> },
  { key: "hemsire",         label: "Hemşire",              color: "#0891B2", icon: <HeartOutlined /> },
  { key: "ebe",             label: "Ebe",                  color: "#EC4899", icon: <HeartOutlined /> },
  { key: "dis-hekimi",      label: "Diş Hekimi",           color: "#2563EB", icon: <ToolOutlined /> },
  { key: "psikolog",        label: "Psikolog",             color: "#8B5CF6", icon: <SmileOutlined /> },
  { key: "diyetisyen",      label: "Diyetisyen",           color: "#22C55E", icon: <BulbOutlined /> },
  { key: "eczaci",          label: "Eczacı",               color: "#7C3AED", icon: <ExperimentOutlined /> },
  { key: "laboratuvar",     label: "Laboratuvar",          color: "#D97706", icon: <DatabaseOutlined /> },
  { key: "radyoloji",       label: "Radyoloji",            color: "#1D4ED8", icon: <AppstoreOutlined /> },
  { key: "fizyoterapi",     label: "Fizyoterapi",          color: "#16A34A", icon: <SettingOutlined /> },
  { key: "anestezi",        label: "Anestezi",             color: "#0F172A", icon: <AlertOutlined /> },
  { key: "acil-tip",        label: "Acil Tıp Teknikeri",  color: "#B91C1C", icon: <ThunderboltOutlined /> },
  { key: "saglik-bt",       label: "Sağlık BT",            color: "#0F766E", icon: <CodeOutlined /> },
  { key: "saglik-yonetimi", label: "Sağlık Yönetimi",      color: "#6B7280", icon: <TeamOutlined /> },
];

const HEALTH_TECHNOLOGY_MAP = {
  "klinik-hekim": [
    // Dahiliye & Genel
    "Hasta Anamnezi", "Fizik Muayene", "Klinik Değerlendirme", "Klinik Protokoller",
    "ICD-10", "Reçete Yazma", "Tele-Tıp", "Poliklinik Hizmetleri", "Hasta Eğitimi",
    "Acil Müdahale", "Hasta Anamnezi",
    // Dahiliye uzmanlıkları
    "Dahiliye", "Kronik Hastalık Yönetimi", "Diyabet Yönetimi", "Hipertansiyon",
    "Gastroenteroloji", "Endoskopi (İç Hastalıkları)", "Hepatoloji",
    "Endokrinoloji", "Tiroid Hastalıkları", "Obezite Yönetimi",
    "Hematoloji (Klinik)", "Romatoloji", "Nefroloji", "Diyaliz",
    "Göğüs Hastalıkları", "Solunum Fonksiyon Testi", "Enfeksiyon Hastalıkları",
    // Kardiyoloji
    "Kardiyoloji", "EKG", "Ekokardiyografi", "Koroner Anjiyografi",
    "Elektrofizyoloji", "Kalp Yetmezliği Yönetimi", "Kateter Laboratuvarı",
    // Nöroloji
    "Nöroloji", "EEG", "EMG", "İnme Tedavisi", "Epilepsi Yönetimi",
    "MS Hastalığı", "Parkinson Hastalığı", "Nöroradyoloji", "Baş Ağrısı Kliniği",
    // Psikiyatri
    "Psikiyatri", "DSM-5", "Psikofarmakolog", "Psikoz Yönetimi",
    "Bağımlılık Tedavisi", "Anksiyete Bozuklukları", "Depresyon Yönetimi",
    // Cerrahi
    "Genel Cerrahi", "Laparoskopik Cerrahi", "Kolesistektomi", "Apendektomi",
    "Kolorektal Cerrahi", "Meme Cerrahisi", "Herni Onarımı",
    "Beyin Cerrahisi", "Nörocerrahi", "Plastik Cerrahi",
    "Kardiyovasküler Cerrahi", "Torasik Cerrahi",
    // Ortopedi
    "Ortopedi ve Travmatoloji", "Artroskopi", "Kırık Tedavisi",
    "Diz Protezi", "Kalça Protezi", "Omurga Cerrahisi", "Spor Yaralanmaları",
    // KBB
    "KBB", "Rinoskopi", "Otoskopi", "İşitme Testleri",
    "Adenotonsillektomi", "Septoplasti", "Fonasyon Bozuklukları", "Baş-Boyun Onkolojisi",
    // Pediatri
    "Pediatri", "Yenidoğan Bakımı", "Aşı Programları",
    "Pediatrik Acil", "Büyüme ve Gelişme Takibi", "Çocuk Kardiyolojisi",
    // Göz
    "Göz Hastalıkları", "Katarakt Cerrahisi", "Refraktif Cerrahi",
    "Glokom Yönetimi", "Retina Hastalıkları", "Biomikroskopi", "Tonometri",
    // Dermatoloji
    "Dermatoloji", "Dermoskopi", "Fototerapi", "Lazer Tedavisi",
    "Cilt Kanseri Taraması", "Estetik Dermatoloji", "Psöriyazis", "Akne Tedavisi",
    // Üroloji
    "Üroloji", "Sistoskopi", "Prostat Hastalıkları", "Böbrek Taşı Tedavisi", "Laparoskopik Üroloji",
  ],
  "hemsire": [
    "Hasta Bakımı", "Vital Bulgular", "İlaç Uygulaması", "Hasta Anamnezi",
    "IV Tedavi", "Kateter Bakımı", "BLS", "ACLS", "EKG", "Triaj",
    // YBÜ
    "Yoğun Bakım Hemşireliği", "Mekanik Ventilasyon", "Kardiyak Monitörizasyon",
    "Entübasyon Desteği", "Sepsis Protokolü", "Hemodinamik Monitörizasyon",
    // Ameliyathane
    "Ameliyathane Hemşireliği", "Sterilizasyon ve Dezenfeksiyon",
    "Aseptik Teknik", "Cerrahi Alet Yönetimi", "Anestezi Hemşireliği", "Hasta Pozisyonlama",
    // Acil
    "Acil Hemşireliği", "Yara Bakımı", "Acil Müdahale", "Kriz Yönetimi",
    // Onkoloji
    "Onkoloji Hemşireliği", "Kemoterapi Uygulaması", "Palyatif Bakım",
    "Ağrı Yönetimi", "Psikolojik Destek",
    // Diğer uzmanlıklar
    "Psikiyatri Hemşireliği", "Çocuk Hemşireliği", "Diyaliz Hemşireliği",
    "Onkoloji Hemşireliği", "Palyatif Bakım Hemşireliği",
    "Enfeksiyon Kontrol", "Hasta Eğitimi", "Evde Bakım Hemşireliği",
    "Kronik Hastalık Yönetimi", "Gerontolojik Hemşirelik",
  ],
  "ebe": [
    "Doğum Takibi", "Normal Doğum Yönetimi", "Sezeryan Desteği",
    "Antenatal Bakım", "Prenatal İzlem", "Gebelik Komplikasyonları",
    "Postnatal Bakım", "Yenidoğan Bakımı", "Emzirme Danışmanlığı",
    "Aile Planlaması", "Kontraseptif Danışmanlık",
    "NST (Non-Stres Test)", "Fetal Monitörizasyon", "Kardiyotokografi",
    "Pelvik Muayene", "Vajinal Muayene", "Ultrasonografi (Temel)",
    "BLS", "ACLS (Obstetrik)", "Yenidoğan Resüsitasyonu",
    "Ebelik Etiği", "Ebelik Mevzuatı", "Doğum Planı Hazırlama",
    "Psikososyal Destek", "Maternal Beslenme Danışmanlığı",
    "Doğum Sonrası Depresyon Tarama", "Anne Sütü Danışmanlığı",
    "ICD-10", "Klinik Protokoller", "Hasta Anamnezi",
  ],
  "dis-hekimi": [
    // Genel Diş Hekimliği
    "Diş Hekimliği", "Klinik Muayene", "Ağız Hijyeni Eğitimi",
    "Diş Çekimi", "Dolgu Tedavisi", "Amalgam", "Kompozit Restorasyon",
    "Panoramik Röntgen", "Periapikal Röntgen", "CBCT (Dijital BT)",
    // Ortodonti
    "Ortodonti", "Braket Uygulaması", "Şeffaf Plak (Aligner)", "Retainer",
    "İskelet Anomalileri", "Büyüme-Gelişim Takibi",
    // İmplantoloji
    "Dental İmplant", "İmplant Cerrahisi", "Kemik Grefti",
    "Sinüs Lifting", "Implant Üstü Protez",
    // Endodonti (Kanal)
    "Endodonti", "Kanal Tedavisi", "Rotary Sistem", "Apex Locator",
    // Periodontoloji
    "Periodontoloji", "Diş Eti Hastalıkları", "Diş Taşı Temizliği",
    "Periodontal Cerrahi", "Gingival Greft",
    // Protez
    "Protetik Diş Tedavisi", "Sabit Protez", "Hareketli Protez",
    "Tam Protez", "Zirkonyum Kron", "Veneer", "Laminat",
    // Pedodonti
    "Pedodonti", "Çocuk Diş Hekimliği", "Fissür Örtücü", "Fluorid Uygulaması",
    // Ağız Cerrahisi
    "Ağız-Diş-Çene Cerrahisi", "Yirmi Yaş Dişi Çekimi", "Kist Operasyonu",
    "Çene Kırığı Tedavisi", "Ortognatik Cerrahi",
    // Estetik & Dijital
    "Estetik Diş Hekimliği", "Diş Beyazlatma", "Dijital Gülüş Tasarımı",
    "CAD/CAM Diş Hekimliği", "Dijital Ölçü", "3D Yazıcı (Diş)", "Lazer Diş Hekimliği",
    "Oklüzyon Analizi", "TME (Eklem Tedavisi)",
    "ICD-10", "Klinik Protokoller",
  ],
  "psikolog": [
    // Temel Değerlendirme
    "Psikolojik Değerlendirme", "Klinik Mülakat", "Psikometrik Test Uygulama",
    "WAIS (Zeka Testi)", "MMPI", "Rorschach", "TAT", "SCL-90",
    "Beck Depresyon Ölçeği", "Hamilton Anksiyete", "DSM-5", "ICD-10",
    // Terapi Yaklaşımları
    "Klinik Psikoloji", "Psikoterapi", "Bilişsel Davranışçı Terapi (CBT)",
    "EMDR", "Kabul ve Kararlılık Terapisi (ACT)", "Şema Terapi",
    "Diyalektik Davranış Terapisi (DBT)", "Psikanalitik Terapi", "Humanistik Terapi",
    "Çözüm Odaklı Terapi", "Motivasyonel Görüşme", "Anlatı Terapisi",
    // Uzmanlık Alanları
    "Çocuk ve Ergen Psikolojisi", "Yetişkin Psikolojisi", "Yaşlılık Psikolojisi",
    "Nöropsikolog", "Adli Psikoloji", "Sağlık Psikolojisi", "Endüstri Psikolojisi",
    "Travma Terapisi", "Yas Danışmanlığı", "Bağımlılık Psikolojisi",
    // Grup & Aile
    "Aile Terapisi", "Çift Terapisi", "Grup Terapisi",
    "Ebeveyn Danışmanlığı", "Çocuk Oyun Terapisi",
    // Klinik Bağlamlar
    "Psikiyatrik Rehabilitasyon", "Hastane Psikolojisi", "Okul Psikolojisi",
    "Kriz Müdahalesi", "İntihar Riski Değerlendirme",
    "Mindfulness", "Stres Yönetimi", "Uyku Bozuklukları",
  ],
  "diyetisyen": [
    // Klinik Beslenme
    "Klinik Beslenme", "Medikal Beslenme Terapisi", "Beslenme Değerlendirmesi",
    "Antropometrik Ölçüm", "Biyokimyasal Parametreler", "Diyet Anamnezi",
    "Diyet Planı Hazırlama", "Besin Analizi", "Kalori Hesaplama",
    // Hastalık Odaklı
    "Diyabetik Beslenme", "Obezite ve Zayıflama", "Kardiyovasküler Beslenme",
    "Renal Diyet (Böbrek)", "Karaciğer Hastalıkları Beslenmesi",
    "Kanser Beslenmesi", "Onkoloji Beslenmesi",
    "Gastrointestinal Hastalıklar (Crohn, İBH, Çölyak)",
    "Fenilketonüri (PKU)", "Metabolik Hastalıklar", "Gıda Alerjisi ve İntoleransı",
    // Beslenme Destek
    "Enteral Beslenme", "Parenteral Beslenme", "Nazogastrik Beslenme",
    "Tüple Beslenme", "Preoperatif ve Postoperatif Beslenme",
    // Yaşam Dönemi
    "Pediatrik Beslenme", "Bebek Beslenmesi", "Annelerde Beslenme",
    "Geriyatrik Beslenme", "Sporcu Beslenmesi", "Vejetaryen / Vegan Beslenme",
    // Koruyucu & Toplum
    "Toplum Beslenmesi", "Beslenme Eğitimi", "Okul Beslenmesi",
    "Halk Sağlığı Beslenmesi", "Mikrobiyom ve Beslenme",
    // Araçlar & Standartlar
    "MNA (Mini Nutrisyon Değerlendirme)", "NRS-2002", "MUST", "SGA",
    "Eicosanoid Dengesi", "NutriBase", "Nutritics",
  ],
  "eczaci": [
    "Klinik Eczacılık", "İlaç Dağıtımı", "Reçete Yönetimi", "Eczane Yönetimi",
    "Farmakovijilans", "Farmakokinetik", "Farmakodinamik", "İlaç Etkileşimleri",
    "ATC Sınıflandırması", "Hastane Eczacılığı", "Toplum Eczacılığı",
    "Onkoloji Eczacılığı", "Psikiyatrik İlaç Yönetimi", "Kardiyak İlaçlar",
    "GMP", "GDP", "GPP", "Parenteral Beslenme", "Steril İlaç Hazırlama",
    "İlaç Geliştirme", "Klinik Araştırma", "Biyoeşdeğerlik",
    "Biyobenzer İlaçlar", "Onkoloji İlaçları (Sitotoksik)",
    "Regülasyon", "İEGMP", "TITCK Süreçleri", "Farmasötik Toksikoloji",
    "İlaç Endüstrisi", "Veteriner Eczacılığı", "Kozmetik Eczacılığı",
    "Reçetesiz Ürün Danışmanlığı", "Hasta Uyum Programları",
  ],
  "laboratuvar": [
    "Klinik Biyokimya", "Hematoloji", "Mikrobiyoloji", "Seroloji", "İmmünoloji",
    "Koagülasyon Testleri", "Kan Sayımı Analizi", "Kan Grubu ve Transfüzyon",
    "Kültür ve Duyarlılık Testi", "Antibiyotik Duyarlılık Testi",
    "Patoloji", "Histopatoloji", "Sitoloji", "Biyopsi İşleme",
    "Moleküler Biyoloji", "PCR", "Real-Time PCR", "NGS (Yeni Nesil Dizileme)",
    "ELISA", "Western Blot", "Akım Sitometrisi (Flow Cytometry)",
    "HPLC", "Elektroforez", "Spektrofotometri", "Kromatografi",
    "GLP", "ISO 15189", "ISO 17025", "Biyogüvenlik (BSL 2-3)",
    "Kalite Yönetimi", "İç Kalite Kontrolü", "Dış Kalite Değerlendirmesi",
    "Laboratuvar Bilgi Sistemi (LIS)", "Otomasyon Sistemleri",
    "Toxikoloji Testleri", "Hormonal Testler", "Tümör Belirteçleri",
    "Üreme Laboratuvarı", "Sperm Analizi",
  ],
  "radyoloji": [
    "Radyoloji", "Diagnostik Radyoloji", "MRI", "BT (CT Scan)",
    "Ultrasonografi", "Doppler Ultrason", "Mamografi", "Kemik Dansitometrisi",
    "Floroskopi", "Fluoroskopi", "Nükleer Tıp", "PET Scan", "SPECT",
    "Girişimsel Radyoloji", "Anjiyografi", "Biyopsi (Radyoloji Kılavuzlu)",
    "Radyasyon Tedavisi (Radyoterapi)", "Medikal Fizik",
    "DICOM", "PACS", "RIS", "Yapay Zeka Destekli Görüntü Analizi",
    "3D Görüntüleme", "Görüntü İşleme", "MPR / MIP Rekonstrüksiyon",
    "Radyasyon Güvenliği", "Radyasyon Koruması",
    "Kontrastlı Çekim", "İyot / Gadolinyum Kontrast Madde",
    "Manyetik Rezonans Anjiografi (MRA)", "Kardiyak BT", "Kardiyak MRI",
    "Pediatrik Radyoloji", "Nöroradyoloji",
  ],
  "fizyoterapi": [
    "Manuel Terapi", "Mobilizasyon", "Manipülasyon", "Maitland", "Kaltenborn",
    "Egzersiz Terapisi", "Terapötik Egzersiz", "Core Stabilizasyon",
    "Elektroterapi", "TENS", "Ultrason Tedavisi", "Lazer Terapi",
    "Hidroterapi", "Sıcak-Soğuk Uygulama", "Balneoterapi",
    "Nörolojik Rehabilitasyon", "Bobath", "PNF", "Vojta", "Brunnstrom",
    "Ortopedik Rehabilitasyon", "Postoperatif Rehabilitasyon",
    "Sporcu Rehabilitasyonu", "Sporcu Yaralanmaları",
    "Kardiyopulmoner Rehabilitasyon", "Solunum Fizyoterapisi",
    "Pediatrik Rehabilitasyon", "CP (Serebral Palsi)", "Gelişimsel Gecikme",
    "Geriatrik Rehabilitasyon", "Denge ve Koordinasyon Eğitimi",
    "Kinezyobant Uygulaması", "Kinesiyoloji", "Ergoterapi",
    "İş Rehabilitasyonu", "Ev Programı Hazırlama",
    "Pelvik Taban Rehabilitasyonu", "Lenfödöm Tedavisi",
    "Pilates", "Yoga Terapisi", "Egzersiz Fizyolojisi",
  ],
  "anestezi": [
    // Anestezi Türleri
    "Genel Anestezi", "Rejyonel Anestezi", "Spinal Anestezi", "Epidural Anestezi",
    "Kombine Spinal-Epidural", "Sinir Bloğu", "Pleksus Bloğu",
    "Sedasyon", "Monitörize Anestezi Bakımı",
    // Havayolu & Monitörizasyon
    "Havayolu Yönetimi", "Entübasyon", "Laringoskopi", "Video Laringoskop",
    "LMA (Laringeal Maske)", "Zor Havayolu Yönetimi", "Fiberoptik Entübasyon",
    "Anestezi Cihazı", "Mekanik Ventilasyon", "Anestezi Makinesi Kalibrasyonu",
    "Kardiyak Monitörizasyon", "İnvaziv Basınç Monitörizasyonu",
    "BIS (Beyin Fonksiyon Monitörü)", "TOF (Nöromusküler Blokaj)",
    // Özel Anestezi Alanları
    "Pediatrik Anestezi", "Kardiyak Anestezi", "Nöroanestezi",
    "Obstetrik Anestezi (Doğum)", "Torasik Anestezi", "Transplant Anestezi",
    "Ambulatuar Anestezi", "Acil Anestezi",
    // YBÜ & Ağrı
    "Yoğun Bakım Anestezisi", "Ağrı Tedavisi", "Kronik Ağrı", "Palyatif Ağrı",
    "Nöropatik Ağrı", "İnterventional Ağrı Tedavisi",
    // İlaç & Güvenlik
    "Anestezik İlaçlar", "Opioid Yönetimi", "Kas Gevşeticiler", "Volatil Anestezikler",
    "İlaç Doz Hesaplama", "Anestezi Komplikasyon Yönetimi",
    "ASA Sınıflandırması", "Preoperatif Değerlendirme", "ICD-10",
  ],
  "acil-tip": [
    "Acil Müdahale", "Hasta Değerlendirme", "Birincil Değerlendirme", "İkincil Değerlendirme",
    "BLS (Temel Yaşam Desteği)", "ACLS (İleri Kardiyak Yaşam Desteği)",
    "PALS (Pediatrik İleri Yaşam Desteği)", "ATLS (İleri Travma Yaşam Desteği)",
    "Triaj", "START Triaj", "Kitlesel Yaralanma Triajı",
    "Defibrilasyon", "AED Kullanımı", "CPR",
    "Entübasyon Desteği", "Hava Yolu Yönetimi", "BVM Maskeleme",
    "IV / IO Erişim", "İntraosseöz İğne", "İV Tedavi", "İlaç Uygulaması",
    "EKG Değerlendirme", "Kardiyak Monitörizasyon", "12 Derivasyonlu EKG",
    "İnme Protokolü", "FAST Değerlendirme",
    "Kırık Sabitleme", "Yara Bakımı", "Yara Kapatma", "Yanık Tedavisi",
    "Omurga Sabitleme", "Kurtarma Teknikleri",
    "Ambulans Hizmetleri", "Hasta Transferi", "Hava Ambulansı",
    "CBRN (Kimyasal-Biyolojik-Radyolojik-Nükleer)",
    "Arama ve Kurtarma", "Afet Tıbbı", "Savaş Sahası İlk Yardım (TCCC)",
    "Hasta Takip Sistemleri", "Radyo Haberleşme",
  ],
  "saglik-bt": [
    // Standartlar & Protokoller
    "FHIR (HL7 FHIR R4)", "HL7 v2.x", "HL7 v3", "CDA", "OpenEHR",
    "ICD-10", "ICD-11", "SNOMED CT", "LOINC", "DRG Kodlama",
    "DICOM", "PACS Entegrasyonu", "RIS",
    // Sistemler
    "HBYS", "Epic EHR", "Cerner", "Mediware", "SAP Health",
    "e-Nabız", "ÇKYS", "E-Reçete", "MHRS",
    "Telemedicine Platform", "Hasta Portal Sistemleri",
    "Klinik Karar Destek Sistemleri (CDSS)", "İlaç-Alerji Kontrol",
    // Analitik & Teknoloji
    "Sağlık Veri Analizi", "Klinik Analitik", "Gerçek Dünya Verisi (RWD)",
    "SQL", "Python", "R (Sağlık)", "Power BI", "Tableau",
    "Yapay Zeka (Sağlık)", "ML (Klinik Tahminleme)", "AI Radyoloji",
    "NLP (Klinik Metin)", "IoT Sağlık Cihazları",
    // Güvenlik & Uyum
    "Veri Güvenliği", "KVKK (Sağlık)", "HIPAA", "ISO 27799",
    "Sağlık Bilişimi Güvenliği", "Kriptografi (Sağlık)",
    // Proje & Mimari
    "Sağlık Bilişimi Mimarisi", "Interoperability", "API Entegrasyonu",
    "Proje Yönetimi (Sağlık BT)", "CPHIMS", "HL7 FHIR Sertifikası",
  ],
  "saglik-yonetimi": [
    // Sekreterlik & Ön Büro
    "Tıbbi Sekreterlik", "Hasta Kabul", "Hasta Yönetimi", "Randevu Yönetimi",
    "Tıbbi Dokümantasyon", "Tıbbi Terminoloji", "Hasta İletişimi",
    "MHRS", "HBYS", "e-Nabız",
    // Faturalama & SGK
    "ICD-10 Kodlama", "DRG Kodlama", "Medikal Faturalama",
    "SGK Süreçleri", "SUT (Sağlık Uygulama Tebliği)", "MEDULA",
    "Özel Sigorta Süreçleri", "Ön Yetkilendirme",
    // Yönetim & Kalite
    "Hastane Yönetimi", "Klinik Yönetim", "Bütçe Yönetimi",
    "Kalite Yönetim Sistemi", "JCI Akreditasyonu", "ISO 9001",
    "Hasta Güvenliği", "Kök Neden Analizi", "FMEA",
    "Sağlık Politikası", "Sağlık Mevzuatı",
    // Kaynaklar & Planlama
    "İnsan Kaynakları (Sağlık)", "Vardiya Planlama", "Performans Yönetimi",
    "Stratejik Planlama", "Süreç İyileştirme", "Lean Healthcare", "6 Sigma",
    "Sağlık Ekonomisi", "Maliyet Analizi",
    "Ofis Yazılımları", "Microsoft Office", "ERP Sistemleri",
  ],
};

const HEALTH_SOFT_SKILL_OPTIONS = [
  "Empati", "Hasta İletişimi", "Aile İletişimi", "Stres Yönetimi",
  "Dikkat ve Titizlik", "Etik Değerlere Bağlılık", "Gizlilik / Mahremiyet",
  "Kriz Yönetimi", "Çok Disiplinli Ekip Çalışması", "Takım Çalışması",
  "İletişim", "Sorumluluk", "Zaman Yönetimi", "Liderlik", "Uyum Sağlama",
  "Psikolojik Destek", "Motivasyon", "Sabır", "Hızlı Karar Verme",
  "Kültürel Duyarlılık", "Hasta Savunuculuğu", "Sürekli Öğrenme",
];

const HEALTH_EDUCATION_OPTIONS = [
  // Klinik Tıp
  "Tıp Fakültesi",
  // Hemşirelik & Ebelik
  "Hemşirelik", "Ebelik",
  // Diş
  "Diş Hekimliği",
  // Eczacılık
  "Eczacılık",
  // Sağlık Bilimleri
  "Fizyoterapi ve Rehabilitasyon", "Ergoterapi",
  "Diyetetik ve Beslenme", "Beslenme ve Diyetetik",
  // Psikoloji
  "Psikoloji", "Klinik Psikoloji",
  // Teknik / Laboratuvar
  "Tıbbi Laboratuvar Teknikleri",
  "Tıbbi Görüntüleme Teknikleri (Radyoloji)",
  "Anestezi Teknikleri",
  "Acil Yardım ve Afet Yönetimi", "İlk ve Acil Yardım",
  // Yönetim & Bilişim
  "Sağlık Yönetimi ve Politikası", "Sağlık Kurumları Yöneticiliği",
  "Tıbbi Dokümantasyon ve Sekreterlik",
  "Sağlık Bilişimi", "Biyomedikal Mühendisliği",
  // Temel Bilimler
  "Biyoloji", "Moleküler Biyoloji ve Genetik",
  "Biyokimya", "Mikrobiyoloji",
];

// ── Puanlama varsayılan ağırlıkları ──────────────────────────────────────────

const DEFAULT_WEIGHTS = { hardSkill: 20, softSkill: 15, education: 10, experience: 20, projectCert: 10, semantic: 25 };

// ── Yardımcı bileşenler ───────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, count, points }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "rgba(57,64,193,0.10)", color: "#3940c1",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Text strong style={{ fontSize: 15, color: "#111827" }}>{title}</Text>
            {points !== undefined && (
              <Tag style={{
                borderRadius: 999, padding: "0 8px", fontSize: 11, fontWeight: 700,
                background: "rgba(57,64,193,0.08)", color: "#3940c1", border: "1px solid #C7D2FE",
              }}>
                maks {points} puan
              </Tag>
            )}
            {count > 0 && (
              <Tag color="blue" style={{ borderRadius: 999, padding: "0 8px", fontSize: 12 }}>
                {count} seçili
              </Tag>
            )}
          </div>
          {subtitle && <Text style={{ fontSize: 12, color: "#9CA3AF" }}>{subtitle}</Text>}
        </div>
      </div>
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function AnalysisDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError, refetch } = useAnalysisById(id);
  const { data: filesData, isLoading: isFilesLoading } = useAnalysisFiles(id);
  const { mutateAsync: runAnalysisMutate, isPending: isRunning } = useRunAnalysis();
  const { data: lastRun, isLoading: isLastRunLoading, refetch: refetchLastRun } = useLastRun(id);
  const { mutateAsync: cloneAnalysisMutate, isPending: isCloning } = useCloneAnalysis();

  const analysis = data?.data;

  if (isError) {
    navigate("/analizler", { replace: true });
    return null;
  }
  const analysisFiles = filesData?.data || [];

  const [api, contextHolder] = notification.useNotification();
  const [latestRunId, setLatestRunId] = useState(null);

  // Progress modal state
  const [progressStep, setProgressStep]   = useState(0);
  const [progressPct,  setProgressPct]    = useState(0);
  const progressTimer = useRef(null);

  const ANALYSIS_STEPS = [
    { title: "PDF'ler Okunuyor",          desc: "CV dosyaları işleniyor ve metin çıkarılıyor…" },
    { title: "Profiller Çıkarılıyor",     desc: "GPT-4o-mini her CV'yi analiz ediyor, beceriler ve deneyim tespit ediliyor…" },
    { title: "Anlamsal Uyum Hesaplanıyor",desc: "CV'ler pozisyonla semantik olarak karşılaştırılıyor…" },
    { title: "Puanlanıyor ve Sıralanıyor",desc: "Tüm kriterler birleştiriliyor, sıralama oluşturuluyor…" },
  ];

  useEffect(() => {
    if (!isRunning) {
      clearInterval(progressTimer.current);
      return;
    }

    const cvCount = analysis?.cvCount || 10;
    const totalMs = Math.max(20_000, cvCount * 550);
    const tickMs  = 400;
    // step ilerleme eşikleri (%)
    const stepAt  = [0, 10, 60, 83];

    setProgressStep(0);
    setProgressPct(0);

    let elapsed = 0;
    progressTimer.current = setInterval(() => {
      elapsed += tickMs;

      let pct;
      if (elapsed <= totalMs) {
        // Ease-out: başta hızlı, sona doğru yavaşlar → 0%..90%
        const ratio = elapsed / totalMs;
        pct = 90 * (1 - Math.pow(1 - ratio, 2.5));
      } else {
        // Tahmini süre aşıldı: 90%'dan 96%'ya asimptotik (hiç takılmaz)
        const overtime = elapsed - totalMs;
        pct = 90 + 6 * (1 - Math.exp(-overtime / totalMs));
      }

      pct = Math.min(Math.round(pct), 96);
      setProgressPct(pct);

      const step = stepAt.findLastIndex((t) => pct >= t);
      setProgressStep(step);
    }, tickMs);

    return () => clearInterval(progressTimer.current);
  }, [isRunning]);

  // Form state
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneForm] = Form.useForm();

  const [jobText, setJobText] = useState("");
  const { mutateAsync: extractJobMutate, isPending: isExtracting } = useExtractJob();

  const handleExtractJob = async () => {
    if (!jobText.trim()) return;
    try {
      const res = await extractJobMutate(jobText);
      const d = res?.data;
      if (d?.hard_skills?.length)       setSelectedSkills(d.hard_skills);
      if (d?.soft_skills?.length)       setSelectedSoftSkills(d.soft_skills);
      if (d?.min_experience_years)      setMinExperienceYears(d.min_experience_years);
      if (d?.education?.length)         setSelectedEducation(d.education);
      api.success({ message: "İlan analiz edildi!", description: "Alanlar otomatik dolduruldu.", placement: "topRight" });
    } catch {
      api.error({ message: "İlan analiz edilemedi.", placement: "topRight" });
    }
  };

  const [sector, setSector] = useState("it");
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });

  const setWeight = (changedKey, newValue) => {
    const clamped = Math.max(0, Math.min(100, Math.round(Number(newValue)) || 0));
    setWeights((prev) => {
      const otherKeys = Object.keys(prev).filter((k) => k !== changedKey);
      const otherTotal = otherKeys.reduce((s, k) => s + prev[k], 0);
      const budget = 100 - clamped;
      const newW = { ...prev, [changedKey]: clamped };

      if (otherTotal === 0) {
        const base = Math.floor(budget / otherKeys.length);
        const rem  = budget - base * otherKeys.length;
        otherKeys.forEach((k, i) => { newW[k] = base + (i < rem ? 1 : 0); });
        return newW;
      }

      const factor = budget / otherTotal;
      let distributed = 0;
      otherKeys.forEach((k) => { newW[k] = Math.floor(prev[k] * factor); distributed += newW[k]; });
      const remainder = budget - distributed;
      otherKeys
        .map((k) => ({ k, frac: prev[k] * factor - newW[k] }))
        .sort((a, b) => b.frac - a.frac)
        .slice(0, remainder)
        .forEach(({ k }) => { newW[k]++; });
      return newW;
    });
  };

  const [runName, setRunName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSoftSkills, setSelectedSoftSkills] = useState([]);
  const [selectedEducation, setSelectedEducation] = useState([]);
  const [minExperienceYears, setMinExperienceYears] = useState(0);
  const [requireProjectOrCertificate, setRequireProjectOrCertificate] = useState(false);
  const [useSemanticSimilarity, setUseSemanticSimilarity] = useState(true);
  const [showWeights, setShowWeights] = useState(false);

  const handleSectorChange = (newSector) => {
    if (newSector === sector) return;
    setSector(newSector);
    setSelectedCategories([]);
    setSelectedSkills([]);
    setSelectedSoftSkills([]);
    setSelectedEducation([]);
    setSkillSearch("");
  };

  const activeCategoryList     = sector === "saglik" ? HEALTH_CATEGORY_LIST     : CATEGORY_LIST;
  const activeTechnologyMap    = sector === "saglik" ? HEALTH_TECHNOLOGY_MAP    : TECHNOLOGY_MAP;
  const activeSoftSkillOptions = sector === "saglik" ? HEALTH_SOFT_SKILL_OPTIONS : SOFT_SKILL_OPTIONS;
  const activeEducationOptions = sector === "saglik" ? HEALTH_EDUCATION_OPTIONS  : EDUCATION_OPTIONS;

  const isAnalysisCompleted =
    analysis?.status === "Tamamlandi" || analysis?.status === "Tamamlandı";

  const resolvedLastRunId =
    latestRunId || lastRun?.data?.id || lastRun?.id || null;

  // Seçili kategorilerin union beceri listesi
  const filteredTechnologies = useMemo(() => {
    const all = selectedCategories.length > 0
      ? [...new Set(selectedCategories.flatMap((k) => activeTechnologyMap[k] || []))]
      : [...new Set(Object.values(activeTechnologyMap).flat())];
    if (!skillSearch.trim()) return all;
    return all.filter((t) => t.toLowerCase().includes(skillSearch.toLowerCase()));
  }, [selectedCategories, skillSearch, activeTechnologyMap]);

  // Kategori toggle (çoklu seçim — seçili becerileri korur)
  const toggleCategory = (key) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setSkillSearch("");
  };

  // Skill toggle
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  // Custom skill ekle
  const addCustomSkill = () => {
    const val = customSkillInput.trim();
    if (!val || selectedSkills.includes(val)) return;
    setSelectedSkills((prev) => [...prev, val]);
    setCustomSkillInput("");
  };

  // Puan dağılımı — kullanıcı ağırlıkları + aktif kriterler → 100 üzerinden
  const scoringItems = useMemo(() => {
    const semOn  = useSemanticSimilarity;
    const projOn = requireProjectOrCertificate;
    const softOn = selectedSoftSkills.length > 0;
    const eduOn  = selectedEducation.length > 0;
    const items = [
      { label: "Teknik Beceriler", weight: weights.hardSkill,   active: true    },
      { label: "Soft Skills",      weight: weights.softSkill,   active: softOn  },
      { label: "Eğitim",           weight: weights.education,   active: eduOn   },
      { label: "Deneyim",          weight: weights.experience,  active: true    },
      { label: "Proje/Sertifika",  weight: weights.projectCert, active: projOn  },
      { label: "Anlamsal Uyum",    weight: weights.semantic,    active: semOn   },
    ];
    const activeSum = items.filter((i) => i.active).reduce((s, i) => s + i.weight, 0);
    const eff = (w) => activeSum > 0 ? Math.round((w / activeSum) * 100) : 0;
    return items.map((item) => ({ ...item, pts: item.active ? eff(item.weight) : null }));
  }, [weights, useSemanticSimilarity, requireProjectOrCertificate, selectedSoftSkills, selectedEducation]);

  // Tamamlanma yüzdesi
  const completionPercent = useMemo(() => {
    let score = 0;
    if (selectedSkills.length >= 3) score += 40;
    else if (selectedSkills.length > 0) score += 15;
    if (selectedSoftSkills.length > 0) score += 15;
    if (selectedEducation.length > 0) score += 15;
    if (minExperienceYears > 0) score += 15;
    if (requireProjectOrCertificate) score += 15;
    return Math.min(score, 100);
  }, [selectedSkills, selectedSoftSkills, selectedEducation, minExperienceYears, requireProjectOrCertificate]);

  const progressColor =
    completionPercent >= 70 ? "#10B981" : completionPercent >= 40 ? "#F59E0B" : "#3940c1";

  const handleRunAnalysis = async () => {
    if (selectedSkills.length === 0) {
      api.warning({ message: "En az bir teknik beceri seçmelisiniz.", placement: "topRight" });
      return;
    }
    try {
      const payload = {
        runName: runName?.trim() || "Yeni Analiz",
        hardSkills: selectedSkills,
        softSkills: selectedSoftSkills,
        educationRequirements: selectedEducation,
        minExperienceYears: Number(minExperienceYears) || 0,
        requireProjectOrCertificate,
        useSemanticSimilarity,
        hardSkillWeight:   weights.hardSkill,
        softSkillWeight:   weights.softSkill,
        educationWeight:   weights.education,
        experienceWeight:  weights.experience,
        projectCertWeight: weights.projectCert,
        semanticWeight:    weights.semantic,
      };
      const response = await runAnalysisMutate({ analysisId: id, payload });
      const runId = response?.data?.runId || response?.data?.id || null;
      setLatestRunId(runId);
      await Promise.all([refetch(), refetchLastRun()]);
      api.success({ message: "Analiz tamamlandı!", description: "Sonuçları görüntüleyebilirsiniz.", placement: "topRight" });
    } catch (error) {
      api.error({
        message: "Analiz başlatılamadı",
        description: error?.response?.data?.message || "Bir hata oluştu.",
        placement: "topRight",
      });
    }
  };

  const handleClone = () => {
    cloneForm.setFieldsValue({ newName: (analysis?.analysisName || "") + " (Kopya)" });
    setCloneModalOpen(true);
  };

  const handleCloneConfirm = async () => {
    try {
      const values = await cloneForm.validateFields();
      const response = await cloneAnalysisMutate({ analysisId: id, newName: values.newName });
      const newId = response?.data?.id;
      setCloneModalOpen(false);
      cloneForm.resetFields();
      api.success({ message: "Analiz klonlandı!", description: "Yeni analize yönlendiriliyorsunuz.", placement: "topRight" });
      if (newId) navigate(`/analizler/${newId}`);
    } catch {
      api.error({ message: "Klon oluşturulamadı.", placement: "topRight" });
    }
  };

  const handleShowResults = async () => {
    try {
      let runId = resolvedLastRunId;
      if (!runId) {
        const refreshed = await refetchLastRun();
        runId = refreshed?.data?.data?.id || refreshed?.data?.id || null;
      }
      if (runId) { navigate(`/analizler/${runId}/results`); return; }
      api.info({ message: "Henüz analiz çalıştırılmamış." });
    } catch {
      api.error({ message: "Sonuçlar açılamadı." });
    }
  };

  const getStatusColor = (s) => {
    if (s === "Tamamlandı" || s === "Tamamlandi") return "#10B981";
    if (s === "Bekliyor") return "#F59E0B";
    return "#3940c1";
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#eef0f7" }}>
      {contextHolder}

      {/* ── Analiz Progress Modal ───────────────────────────────────────── */}
      <Modal
        open={isRunning}
        footer={null}
        closable={false}
        maskClosable={false}
        centered
        width={480}
        styles={{ body: { padding: "36px 32px" } }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #3940c1, #FF6B6B)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <LoadingOutlined style={{ fontSize: 28, color: "#fff" }} spin />
          </div>
          <Title level={4} style={{ margin: 0, color: "#111827" }}>Analiz Çalışıyor</Title>
          <Text style={{ color: "#6B7280", fontSize: 14 }}>
            {analysis?.cvCount} CV işleniyor, lütfen bekleyin…
          </Text>
        </div>

        <Progress
          percent={progressPct}
          strokeColor={{ "0%": "#3940c1", "100%": "#FF6B6B" }}
          strokeWidth={8}
          style={{ marginBottom: 28 }}
        />

        <Steps
          size="small"
          direction="vertical"
          current={progressStep}
          style={{ textAlign: "left" }}
          items={ANALYSIS_STEPS.map((s, i) => ({
            title: <Text strong style={{ fontSize: 13 }}>{s.title}</Text>,
            description: progressStep === i
              ? <Text style={{ fontSize: 12, color: "#6B7280" }}>{s.desc}</Text>
              : null,
            icon: progressStep > i
              ? <CheckCircleOutlined style={{ color: "#10B981" }} />
              : progressStep === i
                ? <LoadingOutlined style={{ color: "#3940c1" }} spin />
                : undefined,
          }))}
        />
      </Modal>

      {/* ── Klon İsim Modalı ───────────────────────────────────────────── */}
      <Modal
        title="Analizi Klonla"
        open={cloneModalOpen}
        onOk={handleCloneConfirm}
        onCancel={() => { setCloneModalOpen(false); cloneForm.resetFields(); }}
        okText="Klonla"
        cancelText="İptal"
        confirmLoading={isCloning}
        okButtonProps={{ style: { background: "#3940c1", borderColor: "#3940c1" } }}
      >
        <Form form={cloneForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="newName"
            label="Yeni Analiz Adı"
            rules={[{ required: true, message: "Analiz adı boş olamaz" }]}
          >
            <Input
              autoFocus
              onPressEnter={handleCloneConfirm}
              placeholder="Analiz adı"
              style={{ borderRadius: 10 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <LoginNavbar />

      <div style={{ paddingTop: 100, paddingBottom: 60 }}>
        <Row justify="center">
          <Col xs={23} md={22} lg={21} xl={20}>

            {/* Geri butonu */}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/analizler")}
              style={{ marginBottom: 20, borderRadius: 999, height: 40 }}
            >
              Analizlere Dön
            </Button>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: 80 }}><Spin size="large" /></div>
            ) : !analysis ? (
              <Card style={{ borderRadius: 24, textAlign: "center", padding: 40 }}>
                <Empty description="Analiz bulunamadı." />
              </Card>
            ) : (
              <>
                {/* ── Üst bilgi bandı ─────────────────────────────────── */}
                <Card
                  style={{ borderRadius: 20, marginBottom: 24, border: "1px solid #E9EDF5", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
                  styles={{ body: { padding: "16px 24px" } }}
                >
                  <Row align="middle" gutter={[16, 8]}>
                    <Col flex="auto">
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <Text strong style={{ fontSize: 18, color: "#111827" }}>{analysis.analysisName}</Text>
                        <Tag style={{ borderRadius: 999, padding: "2px 10px" }}>{analysis.positionName}</Tag>
                        <Tag
                          color={isAnalysisCompleted ? "success" : "warning"}
                          style={{ borderRadius: 999, padding: "2px 10px" }}
                        >
                          {isAnalysisCompleted ? "Tamamlandı" : "Bekliyor"}
                        </Tag>
                      </div>
                      {analysis.description && (
                        <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 4, display: "block" }}>
                          {analysis.description}
                        </Text>
                      )}
                    </Col>
                    <Col>
                      <Space separator={<Divider orientation="vertical" />} style={{ color: "#9CA3AF", fontSize: 13 }}>
                        <Space size={4}><FolderOpenOutlined />{analysis.cvCount} CV</Space>
                        <Space size={4}><UserOutlined />{analysis.userFullName}</Space>
                        <Space size={4}><CalendarOutlined />{new Date(analysis.createdAt).toLocaleDateString("tr-TR")}</Space>
                      </Space>
                    </Col>
                  </Row>
                </Card>

                {/* ── Ana içerik ──────────────────────────────────────── */}
                <Row gutter={[24, 24]} align="top">

                  {/* ── Sol: Form ─────────────────────────────────────── */}
                  <Col xs={24} lg={16}>
                    {isAnalysisCompleted ? (
                      <Card style={{ borderRadius: 24, border: "1px solid #E9EDF5", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                        styles={{ body: { padding: 32 } }}>
                        <Space direction="vertical" size={16} style={{ width: "100%" }}>
                          <div style={{ textAlign: "center" }}>
                            <CheckCircleOutlined style={{ fontSize: 48, color: "#10B981", marginBottom: 12 }} />
                            <Title level={3} style={{ margin: 0 }}>Analiz Tamamlandı</Title>
                            <Paragraph style={{ color: "#6B7280", marginTop: 8 }}>
                              Aday sıralaması ve puanlar hazır. Sonuçları inceleyebilirsin.
                            </Paragraph>
                          </div>
                          <Button
                            type="primary" size="large" loading={isLastRunLoading}
                            onClick={handleShowResults}
                            style={{ borderRadius: 999, height: 50, width: "100%", background: "#3940c1", border: "none", fontWeight: 600 }}
                          >
                            Sonuçları Görüntüle
                          </Button>

                        </Space>
                      </Card>
                    ) : (
                      <Card
                        style={{ borderRadius: 24, border: "1px solid #E9EDF5", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
                        styles={{ body: { padding: 32 } }}
                      >
                        {/* ── SEKTÖR SEÇİMİ ────────────────────────────── */}
                        <div style={{ marginBottom: 28 }}>
                          <Text style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", letterSpacing: 0.5, display: "block", marginBottom: 10 }}>
                            SEKTÖR
                          </Text>
                          <div style={{ display: "flex", gap: 12 }}>
                            {[
                              { key: "it",     label: "Yazılım & BT", icon: <CodeOutlined />,         color: "#3940c1" },
                              { key: "saglik", label: "Sağlık",        icon: <MedicineBoxOutlined />,  color: "#DC2626" },
                            ].map((s) => {
                              const active = sector === s.key;
                              return (
                                <div
                                  key={s.key}
                                  onClick={() => handleSectorChange(s.key)}
                                  style={{
                                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    padding: "14px 20px", borderRadius: 16, cursor: "pointer",
                                    border: active ? `2px solid ${s.color}` : "1.5px solid #E5E7EB",
                                    background: active ? `${s.color}12` : "#fff",
                                    transition: "all 0.18s",
                                  }}
                                >
                                  <div style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: active ? s.color : "#F3F4F6",
                                    color: active ? "#fff" : "#9CA3AF",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                                  }}>
                                    {active ? <CheckCircleOutlined /> : s.icon}
                                  </div>
                                  <Text strong style={{ fontSize: 15, color: active ? s.color : "#374151" }}>
                                    {s.label}
                                  </Text>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <Divider style={{ margin: "0 0 28px" }} />

                        {/* ── BÖLÜM 0: İş İlanı Otomatik Doldur ─────────── */}
                        <div style={{
                          background: "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)",
                          border: "1.5px solid #C7D2FE",
                          borderRadius: 18,
                          padding: "20px 22px",
                          marginBottom: 28,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: 12,
                              background: "linear-gradient(135deg, #3940c1, #7C3AED)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                              boxShadow: "0 4px 12px rgba(57,64,193,0.30)",
                            }}>
                              <ThunderboltOutlined style={{ color: "#fff", fontSize: 18 }} />
                            </div>
                            <div>
                              <Text strong style={{ fontSize: 15, color: "#1E1B4B", display: "block" }}>
                                İş İlanından Otomatik Doldur
                              </Text>
                              <Text style={{ fontSize: 12, color: "#6B7280" }}>
                                LinkedIn veya başka bir kaynaktan iş ilanı metnini yapıştırın
                              </Text>
                            </div>
                          </div>

                          <Input.TextArea
                            value={jobText}
                            onChange={(e) => setJobText(e.target.value)}
                            placeholder="İş ilanı metnini buraya yapıştırın… Teknik beceriler, deneyim ve eğitim alanları otomatik doldurulacak."
                            rows={4}
                            style={{
                              borderRadius: 12, resize: "none", marginBottom: 10,
                              border: "1.5px solid #C7D2FE",
                              background: "rgba(255,255,255,0.75)",
                              fontSize: 13,
                            }}
                          />

                          <Button
                            icon={<ThunderboltOutlined />}
                            onClick={handleExtractJob}
                            loading={isExtracting}
                            disabled={!jobText.trim()}
                            block
                            style={{
                              borderRadius: 10, height: 40,
                              background: jobText.trim()
                                ? "linear-gradient(135deg, #3940c1, #7C3AED)"
                                : undefined,
                              color: jobText.trim() ? "#fff" : undefined,
                              border: "none", fontWeight: 600,
                              boxShadow: jobText.trim() ? "0 4px 14px rgba(57,64,193,0.30)" : "none",
                            }}
                          >
                            {isExtracting ? "Analiz Ediliyor…" : "İlanı Analiz Et ve Otomatik Doldur"}
                          </Button>

                          {(selectedSkills.length > 0 || selectedSoftSkills.length > 0 || selectedEducation.length > 0) && (
                            <div style={{
                              marginTop: 14, padding: "10px 14px", borderRadius: 10,
                              background: "rgba(16,185,129,0.08)", border: "1px solid #A7F3D0",
                              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                            }}>
                              <CheckCircleOutlined style={{ color: "#059669", fontSize: 14 }} />
                              <Text style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>
                                Dolduruldu:
                              </Text>
                              {selectedSkills.length > 0 && (
                                <Tag style={{ borderRadius: 999, fontSize: 11, background: "#D1FAE5", borderColor: "#A7F3D0", color: "#065F46" }}>
                                  {selectedSkills.length} teknik beceri
                                </Tag>
                              )}
                              {selectedSoftSkills.length > 0 && (
                                <Tag style={{ borderRadius: 999, fontSize: 11, background: "#D1FAE5", borderColor: "#A7F3D0", color: "#065F46" }}>
                                  {selectedSoftSkills.length} yetkinlik
                                </Tag>
                              )}
                              {selectedEducation.length > 0 && (
                                <Tag style={{ borderRadius: 999, fontSize: 11, background: "#D1FAE5", borderColor: "#A7F3D0", color: "#065F46" }}>
                                  {selectedEducation.length} eğitim alanı
                                </Tag>
                              )}
                              {minExperienceYears > 0 && (
                                <Tag style={{ borderRadius: 999, fontSize: 11, background: "#D1FAE5", borderColor: "#A7F3D0", color: "#065F46" }}>
                                  {minExperienceYears} yıl deneyim
                                </Tag>
                              )}
                            </div>
                          )}
                        </div>

                        <Divider style={{ margin: "0 0 28px" }} />

                        {/* Tamamlanma çubuğu */}
                        <div style={{ marginBottom: 28 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text style={{ fontSize: 13, color: "#6B7280" }}>Kriter doluluğu</Text>
                            <Text strong style={{ fontSize: 13, color: progressColor }}>{completionPercent}%</Text>
                          </div>
                          <Progress percent={completionPercent} showInfo={false}
                            strokeColor={progressColor} railColor="#EEF2FF" size={6} />
                        </div>

                        {/* ── BÖLÜM 1: Analiz Adı ─────────────────────── */}
                        <SectionHeader
                          icon={<BookOutlined />}
                          title="Analiz Çalıştırma Adı"
                          subtitle="İsteğe bağlı — daha sonra tanımlamanızı kolaylaştırır"
                        />
                        <Input
                          value={runName}
                          onChange={(e) => setRunName(e.target.value)}
                          placeholder="Örn: Backend Java Senior — Mayıs 2025"
                          style={{ borderRadius: 12, height: 44, marginBottom: 28 }}
                        />

                        <Divider style={{ margin: "0 0 28px" }} />

                        {/* ── BÖLÜM 2: Kategori ─────────────────────────── */}
                        <SectionHeader
                          icon={<AppstoreOutlined />}
                          title={sector === "saglik" ? "Uzmanlık Alanı Filtresi" : "Teknoloji Filtresi"}
                          subtitle="Birden fazla seçebilirsiniz — boş bırakırsanız tüm beceriler listelenir"
                          count={selectedCategories.length}
                        />
                        <Row gutter={[10, 10]} style={{ marginBottom: 28 }}>
                          {activeCategoryList.map((cat) => {
                            const active = selectedCategories.includes(cat.key);
                            return (
                              <Col xs={12} sm={8} key={cat.key}>
                                <div
                                  onClick={() => toggleCategory(cat.key)}
                                  style={{
                                    border: active ? `2px solid ${cat.color}` : "1.5px solid #E5E7EB",
                                    borderRadius: 16,
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    background: active ? `${cat.color}12` : "#fff",
                                    display: "flex", alignItems: "center", gap: 10,
                                    transition: "all 0.18s",
                                  }}
                                >
                                  <div style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    background: active ? cat.color : "#F3F4F6",
                                    color: active ? "#fff" : "#6B7280",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 16, flexShrink: 0,
                                  }}>
                                    {active ? <CheckCircleOutlined /> : cat.icon}
                                  </div>
                                  <Text strong style={{ color: active ? cat.color : "#374151", fontSize: 14 }}>
                                    {cat.label}
                                  </Text>
                                </div>
                              </Col>
                            );
                          })}
                        </Row>

                        <Divider style={{ margin: "0 0 28px" }} />

                        {/* ── BÖLÜM 3: Teknik Beceriler ────────────────── */}
                        <SectionHeader
                          icon={<CodeOutlined />}
                          title={sector === "saglik" ? "Klinik & Teknik Beceriler" : "Teknik Beceriler"}
                          subtitle={sector === "saglik" ? "Pozisyon için gerekli klinik beceri ve yetkinlikleri seçin (çok seçimli)" : "Pozisyon için gerekli dil ve teknolojileri seçin (çok seçimli)"}
                          count={selectedSkills.length}
                          points={20}
                        />

                        {/* Seçili skill'ler */}
                        {selectedSkills.length > 0 && (
                          <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 12, background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                            <Text style={{ fontSize: 12, color: "#6366F1", fontWeight: 600, display: "block", marginBottom: 8 }}>
                              SEÇİLİ BECERİLER
                            </Text>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {selectedSkills.map((s) => (
                                <Tag
                                  key={s}
                                  closable
                                  onClose={() => toggleSkill(s)}
                                  style={{
                                    borderRadius: 999, padding: "4px 10px",
                                    background: "#3940c1", color: "#fff",
                                    border: "none", fontSize: 13, fontWeight: 500,
                                  }}
                                  closeIcon={<CloseOutlined style={{ fontSize: 10, color: "#fff" }} />}
                                >
                                  {s}
                                </Tag>
                              ))}
                              <Tag
                                onClick={() => setSelectedSkills([])}
                                style={{ borderRadius: 999, cursor: "pointer", padding: "4px 10px", color: "#EF4444", borderColor: "#EF4444" }}
                              >
                                Tümünü Temizle
                              </Tag>
                            </div>
                          </div>
                        )}

                        {/* Arama */}
                        <Input
                          prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                          placeholder="Teknoloji ara..."
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          style={{ borderRadius: 12, height: 40, marginBottom: 10 }}
                          allowClear
                        />

                        {/* Teknoloji grid */}
                        <div style={{
                          display: "flex", flexWrap: "wrap", gap: 8,
                          maxHeight: 200, overflowY: "auto", paddingRight: 4, marginBottom: 12,
                        }}>
                          {filteredTechnologies.map((tech) => {
                            const sel = selectedSkills.includes(tech);
                            return (
                              <Tag
                                key={tech}
                                onClick={() => toggleSkill(tech)}
                                style={{
                                  cursor: "pointer", borderRadius: 999,
                                  padding: "6px 14px", fontSize: 13,
                                  border: sel ? "1.5px solid #3940c1" : "1.5px solid #E5E7EB",
                                  background: sel ? "rgba(57,64,193,0.10)" : "#FAFAFA",
                                  color: sel ? "#3940c1" : "#4B5563",
                                  fontWeight: sel ? 600 : 400,
                                  transition: "all 0.15s",
                                  userSelect: "none",
                                }}
                              >
                                {sel && "✓ "}{tech}
                              </Tag>
                            );
                          })}
                          {filteredTechnologies.length === 0 && (
                            <Text style={{ color: "#9CA3AF", fontSize: 13 }}>Sonuç bulunamadı</Text>
                          )}
                        </div>

                        {/* Custom skill ekle */}
                        <Space.Compact style={{ display: "flex" }}>
                          <Input
                            value={customSkillInput}
                            onChange={(e) => setCustomSkillInput(e.target.value)}
                            onPressEnter={addCustomSkill}
                            placeholder="Listede olmayan beceri ekle..."
                            style={{ flex: 1, height: 40 }}
                          />
                          <Button
                            icon={<PlusOutlined />}
                            onClick={addCustomSkill}
                            style={{ height: 40, background: "#3940c1", color: "#fff", border: "none" }}
                          >
                            Ekle
                          </Button>
                        </Space.Compact>

                        <Divider style={{ margin: "28px 0" }} />

                        {/* ── BÖLÜM 4: Soft Skills ───────────────────── */}
                        <SectionHeader
                          icon={<TeamOutlined />}
                          title="Kişisel Yetkinlikler"
                          subtitle="Adaylarda aranacak davranışsal özellikler (isteğe bağlı)"
                          count={selectedSoftSkills.length}
                          points={15}
                        />
                        {selectedSoftSkills.length > 0 && (
                          <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 12, background: "#F0FDF4", border: "1px solid #A7F3D0" }}>
                            <Text style={{ fontSize: 12, color: "#059669", fontWeight: 600, display: "block", marginBottom: 8 }}>
                              SEÇİLİ YETKİNLİKLER
                            </Text>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {selectedSoftSkills.map((s) => (
                                <Tag
                                  key={s}
                                  closable
                                  onClose={() => setSelectedSoftSkills((prev) => prev.filter((x) => x !== s))}
                                  style={{
                                    borderRadius: 999, padding: "4px 10px",
                                    background: "#059669", color: "#fff",
                                    border: "none", fontSize: 13, fontWeight: 500,
                                  }}
                                  closeIcon={<CloseOutlined style={{ fontSize: 10, color: "#fff" }} />}
                                >
                                  {s}
                                </Tag>
                              ))}
                              <Tag
                                onClick={() => setSelectedSoftSkills([])}
                                style={{ borderRadius: 999, cursor: "pointer", padding: "4px 10px", color: "#EF4444", borderColor: "#EF4444" }}
                              >
                                Tümünü Temizle
                              </Tag>
                            </div>
                          </div>
                        )}
                        <SelectableTagGroup
                          options={activeSoftSkillOptions}
                          selectedValues={selectedSoftSkills}
                          onChange={setSelectedSoftSkills}
                        />

                        <Divider style={{ margin: "28px 0" }} />

                        {/* ── BÖLÜM 5: Eğitim ────────────────────────── */}
                        <SectionHeader
                          icon={<BookOutlined />}
                          title="Tercih Edilen Eğitim Alanları"
                          subtitle="Hangi bölümler öncelikli değerlendirilsin? (isteğe bağlı)"
                          count={selectedEducation.length}
                          points={10}
                        />
                        {selectedEducation.length > 0 && (
                          <div style={{ marginBottom: 12, padding: "12px 16px", borderRadius: 12, background: "#FFFBEB", border: "1px solid #FCD34D" }}>
                            <Text style={{ fontSize: 12, color: "#D97706", fontWeight: 600, display: "block", marginBottom: 8 }}>
                              SEÇİLİ EĞİTİM ALANLARI
                            </Text>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {selectedEducation.map((s) => (
                                <Tag
                                  key={s}
                                  closable
                                  onClose={() => setSelectedEducation((prev) => prev.filter((x) => x !== s))}
                                  style={{
                                    borderRadius: 999, padding: "4px 10px",
                                    background: "#D97706", color: "#fff",
                                    border: "none", fontSize: 13, fontWeight: 500,
                                  }}
                                  closeIcon={<CloseOutlined style={{ fontSize: 10, color: "#fff" }} />}
                                >
                                  {s}
                                </Tag>
                              ))}
                              <Tag
                                onClick={() => setSelectedEducation([])}
                                style={{ borderRadius: 999, cursor: "pointer", padding: "4px 10px", color: "#EF4444", borderColor: "#EF4444" }}
                              >
                                Tümünü Temizle
                              </Tag>
                            </div>
                          </div>
                        )}
                        <SelectableTagGroup
                          options={activeEducationOptions}
                          selectedValues={selectedEducation}
                          onChange={setSelectedEducation}
                        />

                        <Divider style={{ margin: "28px 0" }} />

                        {/* ── BÖLÜM 6: Değerlendirme Ayarları ─────────── */}
                        <SectionHeader
                          icon={<SettingOutlined />}
                          title="Değerlendirme Kriterleri"
                          subtitle="Puanlama yöntemini özelleştirin"
                        />

                        {/* ── Puan Ağırlıkları (gizli/açık) ───────────── */}
                        <div style={{ marginBottom: 12 }}>
                          {/* Başlık satırı — her zaman görünür */}
                          <div
                            onClick={() => setShowWeights((v) => !v)}
                            style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              padding: "13px 18px", cursor: "pointer",
                              border: "1.5px solid #E5E7EB",
                              borderRadius: showWeights ? "16px 16px 0 0" : 16,
                              background: showWeights ? "#FAFBFF" : "#fff",
                              transition: "border-radius 0.2s",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 18, lineHeight: 1 }}>⚡</span>
                              <div>
                                <Text strong style={{ fontSize: 14, color: "#111827", display: "block" }}>
                                  Puanlama Ağırlıkları
                                </Text>
                                <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                                  Her kriterin puana katkısını ayarlayın
                                </Text>
                              </div>
                            </div>
                            <Text style={{ fontSize: 13, color: "#3940c1", fontWeight: 600, userSelect: "none" }}>
                              {showWeights ? "Kapat ▲" : "Ayarla ▼"}
                            </Text>
                          </div>

                          {/* Slider paneli — açıldığında görünür */}
                          {showWeights && (
                            <div style={{
                              border: "1.5px solid #E5E7EB", borderTop: "none",
                              borderRadius: "0 0 16px 16px",
                              padding: "16px 20px 8px",
                              background: "#FAFBFF",
                            }}>
                              {/* Sıfırla aksiyonu */}
                              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                                <Button
                                  size="small"
                                  onClick={() => setWeights({ ...DEFAULT_WEIGHTS })}
                                  style={{ borderRadius: 8, fontSize: 11, height: 26, color: "#6B7280" }}
                                >
                                  Varsayılana Sıfırla
                                </Button>
                              </div>

                              {[
                                { key: "hardSkill",   label: "Teknik Beceriler", color: "#3940c1" },
                                { key: "softSkill",   label: "Soft Skills",       color: "#059669" },
                                { key: "experience",  label: "Deneyim",           color: "#7C3AED" },
                                { key: "education",   label: "Eğitim",            color: "#D97706" },
                                { key: "projectCert", label: "Proje / Sertifika", color: "#0891B2" },
                                { key: "semantic",    label: "Anlamsal Uyum",     color: "#DC2626" },
                              ].map(({ key, label, color }) => {
                                const pct = weights[key];
                                return (
                                  <div key={key} style={{ marginBottom: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                      <Text style={{ fontSize: 13, color: "#374151" }}>{label}</Text>
                                      <Text style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>
                                        {weights[key]}&nbsp;
                                        <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(%{pct} etki)</span>
                                      </Text>
                                    </div>
                                    <Slider
                                      min={0} max={100} step={1}
                                      value={weights[key]}
                                      onChange={(v) => setWeight(key, v)}
                                      tooltip={{ formatter: (v) => `Ağırlık: ${v}` }}
                                      styles={{
                                        track:  { background: color },
                                        handle: { borderColor: color },
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Deneyim */}
                        <Card
                          style={{ borderRadius: 16, border: "1.5px solid #E5E7EB", marginBottom: 12 }}
                          styles={{ body: { padding: "14px 18px" } }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Minimum Deneyim (Yıl)</Text>
                              <br />
                              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                                Bu yıldan az deneyimi olan adaylar daha düşük puan alır
                              </Text>
                            </div>
                            <Space.Compact>
                              <InputNumber
                                min={0} max={30} value={minExperienceYears}
                                onChange={(v) => setMinExperienceYears(v || 0)}
                                style={{ width: 65 }}
                              />
                              <Input disabled value="yıl" style={{ width: 44, textAlign: "center", background: "#f5f5f5", color: "#374151" }} />
                            </Space.Compact>
                          </div>
                        </Card>

                        {/* Proje/Sertifika */}
                        <Card
                          style={{
                            borderRadius: 16, marginBottom: 12,
                            border: requireProjectOrCertificate ? "1.5px solid #3940c1" : "1.5px solid #E5E7EB",
                            background: requireProjectOrCertificate ? "rgba(57,64,193,0.04)" : "#fff",
                          }}
                          styles={{ body: { padding: "14px 18px" } }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Proje ve Sertifikalar Etkili Olsun</Text>
                              <br />
                              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                                CV'de proje/sertifika bulunması ek puan kazandırır  
                              </Text>
                            </div>
                            <Switch
                              checked={requireProjectOrCertificate}
                              onChange={setRequireProjectOrCertificate}
                              style={requireProjectOrCertificate ? { background: "#3940c1" } : {}}
                            />
                          </div>
                        </Card>

                        {/* Semantik */}
                        <Card
                          style={{
                            borderRadius: 16, marginBottom: 12,
                            border: useSemanticSimilarity ? "1.5px solid #3940c1" : "1.5px solid #E5E7EB",
                            background: useSemanticSimilarity ? "rgba(57,64,193,0.04)" : "#fff",
                          }}
                          styles={{ body: { padding: "14px 18px" } }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text strong>Anlamsal Uyum Skoru</Text>
                              <br />
                              <Text style={{ color: "#6B7280", fontSize: 12 }}>
                                CV metninin seçilen beceriler ve iş tanımıyla anlamsal yakınlığı 
                              </Text>
                            </div>
                            <Switch
                              checked={useSemanticSimilarity}
                              onChange={setUseSemanticSimilarity}
                              style={useSemanticSimilarity ? { background: "#3940c1" } : {}}
                            />
                          </div>
                        </Card>


                        <Divider style={{ margin: "28px 0" }} />

                        {/* ── Analiz başlat butonu ─────────────────────── */}
                        <Button
                          type="primary"
                          size="large"
                          loading={isRunning}
                          onClick={handleRunAnalysis}
                          icon={<RocketOutlined />}
                          block
                          disabled={selectedSkills.length === 0}
                          style={{
                            height: 54, borderRadius: 999, fontSize: 16, fontWeight: 700,
                            background: selectedSkills.length > 0 ? "#FF6B6B" : undefined,
                            border: "none",
                            boxShadow: selectedSkills.length > 0 ? "0 10px 24px rgba(255,107,107,0.28)" : "none",
                          }}
                        >
                          {isRunning ? "Analiz Çalışıyor..." : "Analizi Başlat"}
                        </Button>
                        {selectedSkills.length === 0 && (
                          <Text style={{ display: "block", textAlign: "center", marginTop: 8, color: "#F59E0B", fontSize: 13 }}>
                            ⚠ Analiz başlatmak için en az 1 teknik beceri seçin
                          </Text>
                        )}
                      </Card>
                    )}
                  </Col>

                  {/* ── Sağ: Sidebar ──────────────────────────────────── */}
                  <Col xs={24} lg={8}>
                    <div style={{ position: "sticky", top: 100, display: "grid", gap: 20 }}>

                      {/* CV dosyaları */}
                      <Card
                        style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}
                        styles={{ body: { padding: 20 } }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <Text strong style={{ fontSize: 15 }}>Yüklenen CV'ler</Text>
                          <Badge count={analysisFiles.length} color="#3940c1" />
                        </div>
                        {isFilesLoading ? (
                          <div style={{ textAlign: "center", padding: 20 }}><Spin /></div>
                        ) : analysisFiles.length === 0 ? (
                          <Empty description="Dosya yok" imageStyle={{ height: 40 }} />
                        ) : (
                          <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                            {analysisFiles.map((f) => (
                              <div key={f.id} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 12px", borderRadius: 12,
                                background: "#F8FAFF", border: "1px solid #E8EDFF",
                              }}>
                                <FilePdfOutlined style={{ color: "#3940c1", fontSize: 16, flexShrink: 0 }} />
                                <Text style={{ fontSize: 12, color: "#374151" }}
                                  ellipsis={{ tooltip: f.originalFileName }}>
                                  {f.originalFileName}
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>

                      {/* Anlık Kriter Özeti */}
                      {!isAnalysisCompleted && (
                        <Card
                          style={{ borderRadius: 20, border: "1px solid #E9EDF5", boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}
                          styles={{ body: { padding: 20 } }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <Text strong style={{ fontSize: 15 }}>Kriter Özeti</Text>
                            <div style={{
                              fontSize: 12, fontWeight: 700, color: progressColor,
                              background: `${progressColor}18`, borderRadius: 999, padding: "2px 10px",
                            }}>
                              {completionPercent}% dolu
                            </div>
                          </div>

                          <div style={{ display: "grid", gap: 10 }}>
                            <SummaryRow label="Kategori"
                              value={selectedCategories.length > 0
                                ? activeCategoryList.filter((c) => selectedCategories.includes(c.key)).map((c) => c.label).join(", ")
                                : "Tümü"}
                              filled />
                            <SummaryRow
                              label="Teknik Beceriler"
                              value={selectedSkills.length > 0 ? `${selectedSkills.length} beceri seçili` : null}
                              detail={selectedSkills.slice(0, 3).join(", ") + (selectedSkills.length > 3 ? "..." : "")}
                              required
                            />
                            <SummaryRow
                              label="Soft Skills"
                              value={selectedSoftSkills.length > 0 ? `${selectedSoftSkills.length} seçili` : null}
                            />
                            <SummaryRow
                              label="Eğitim"
                              value={selectedEducation.length > 0 ? selectedEducation[0] : null}
                            />
                            <SummaryRow
                              label="Min. Deneyim"
                              value={minExperienceYears > 0 ? `${minExperienceYears} yıl` : null}
                            />
                            <SummaryRow
                              label="Proje/Sertifika"
                              value={requireProjectOrCertificate ? "Aktif (+10 puan)" : null}
                            />
                            <SummaryRow
                              label="Anlamsal Uyum"
                              value={useSemanticSimilarity ? "Aktif (+25 puan)" : "Devre dışı"}
                              filled={useSemanticSimilarity}
                            />
                          </div>

                          {/* Puan dağılımı */}
                          <Divider style={{ margin: "14px 0 10px" }} />
                          <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, letterSpacing: 0.5 }}>
                            PUAN DAĞILIMI (TOPLAM 100)
                          </Text>
                          <div style={{ marginTop: 8, display: "grid", gap: 5 }}>
                            {scoringItems.map(({ label, pts, active }) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ fontSize: 12, color: active ? "#6B7280" : "#D1D5DB", textDecoration: active ? "none" : "line-through" }}>
                                  {label}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: 600, color: active ? "#374151" : "#D1D5DB" }}>
                                  {active ? `${pts} puan` : "devre dışı"}
                                </Text>
                              </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 5, marginTop: 2 }}>
                              <Text style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Toplam</Text>
                              <Text style={{ fontSize: 12, fontWeight: 700, color: "#3940c1" }}>100 puan</Text>
                            </div>
                          </div>
                        </Card>
                      )}

                    </div>
                  </Col>
                </Row>

              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
}

// Özet satırı yardımcı bileşeni
function SummaryRow({ label, value, detail, required, filled }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
      <Text style={{ fontSize: 12, color: "#6B7280", flexShrink: 0 }}>
        {required && !value && <span style={{ color: "#EF4444" }}>* </span>}
        {label}
      </Text>
      <div style={{ textAlign: "right" }}>
        {value ? (
          <Text style={{ fontSize: 12, fontWeight: 600, color: filled ? "#3940c1" : "#111827" }}>
            {value}
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: "#D1D5DB" }}>—</Text>
        )}
        {detail && value && (
          <Text style={{ fontSize: 11, color: "#9CA3AF", display: "block" }}>{detail}</Text>
        )}
      </div>
    </div>
  );
}
