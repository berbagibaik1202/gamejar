import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, CheckCircle, AlertTriangle, Cpu, Terminal as TerminalIcon, 
  HelpCircle, Wifi, Database, Clock, RefreshCw, Send, ArrowRight,
  Monitor, Network, Info, Server, BookOpen, Cable, Volume2, ShieldAlert
} from 'lucide-react';

// ============================================================================
// STATIC DATA: MISSION BLUEPRINTS
// ============================================================================
interface Objective {
  id: string;
  text: string;
  completed: boolean;
}

interface Mission {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  xpReward: number;
  technicalGuide: string;
  objectives: Objective[];
}

const MISSIONS_DATA: Mission[] = [
  {
    id: 1,
    code: 'M01',
    title: 'Konektivitas Dasar',
    subtitle: 'Kabel UTP & IP Address',
    description: 'PC Client-1 tidak bisa terhubung ke Jaringan Utama. Kabel UTP belum di-crimping dengan benar, belum terpasang, dan IP Address PC belum dikonfigurasikan. Lakukan crimping kabel T568B Straight, hubungkan PC-1 ke port Fa0/1 Switch dan atur IP Statis.',
    difficulty: 'Mudah',
    xpReward: 1000,
    technicalGuide: '1. Klik tombol "Crimping UTP" di panel Misi untuk merakit kabel Straight-Through (T568B).\n2. Pasang kabel LAN (UTP) dari PC-1 (FastEthernet0) ke Switch (Fa0/1).\n3. Atur IP PC-1: 192.168.1.2, Netmask: 255.255.255.0, Gateway: 192.168.1.1.\n4. Masuk ke Command Prompt PC-1, lakukan "ping 192.168.1.1".',
    objectives: [
      { id: 'm1_crimping', text: 'Lakukan Crimping Kabel UTP T568B (Straight-Through) dengan benar', completed: false },
      { id: 'm1_cable', text: 'Hubungkan PC-1 ke Switch Port Fa0/1 dengan Kabel UTP', completed: false },
      { id: 'm1_ip', text: 'Atur IP Statis PC-1 ke 192.168.1.2 / Gateway 192.168.1.1', completed: false },
      { id: 'm1_ping', text: 'Uji konektivitas dengan "ping 192.168.1.1" dari PC-1', completed: false }
    ]
  },
  {
    id: 2,
    code: 'M02',
    title: 'Konflik IP Address',
    subtitle: 'Duplikasi IP di Subnet',
    description: 'Ada gangguan koneksi berat di Lab. Setelah dianalisis, PC-2 dan PC-3 sama-sama menggunakan IP 192.168.1.10. Ubah IP PC-3 ke IP kosong yang aman yaitu 192.168.1.11.',
    difficulty: 'Mudah',
    xpReward: 1200,
    technicalGuide: '1. Klik PC-3 lalu buka menu "Konfigurasi IP".\n2. Ubah IP Address PC-3 menjadi 192.168.1.11 (Netmask 255.255.255.0 tetap).\n3. Buka Command Prompt di PC-3 dan lakukan "ping 192.168.1.1" untuk memicu pembersihan ARP.',
    objectives: [
      { id: 'm2_change_ip', text: 'Ubah IP PC-3 menjadi 192.168.1.11', completed: false },
      { id: 'm2_ping', text: 'Lakukan ping ke 192.168.1.1 dari PC-3 untuk verifikasi koneksi', completed: false }
    ]
  },
  {
    id: 3,
    code: 'M03',
    title: 'Segregasi VLAN',
    subtitle: 'Virtual LAN Configuration',
    description: 'Trafik data Departemen HR (Fa0/1 - Fa0/2) dan Departemen Finance (Fa0/3 - Fa0/4) saling bocor. Konfigurasikan VLAN 10 (HR) dan VLAN 20 (Finance) di Switch Utama via CLI.',
    difficulty: 'Sedang',
    xpReward: 1800,
    technicalGuide: '1. Gunakan kabel Console dari Laptop Admin (RS232) ke Switch (Console).\n2. Masuk ke Terminal Laptop, ketik: "enable", "configure terminal".\n3. Buat vlan 10 ("vlan 10" -> "name HR") dan vlan 20 ("vlan 20" -> "name Finance").\n4. Alokasikan port Fa0/1 & Fa0/2 ke VLAN 10 ("interface range fa0/1 - 2" -> "switchport access vlan 10").\n5. Alokasikan port Fa0/3 & Fa0/4 ke VLAN 20 ("interface range fa0/3 - 4" -> "switchport access vlan 20").',
    objectives: [
      { id: 'm3_console', text: 'Pasang kabel Console dari Laptop Admin ke Switch Utama', completed: false },
      { id: 'm3_vlan_create', text: 'Buat VLAN 10 (HR) dan VLAN 20 (Finance) di Switch', completed: false },
      { id: 'm3_vlan_assign', text: 'Alokasikan port Fa0/1-2 ke VLAN 10, dan port Fa0/3-4 ke VLAN 20', completed: false }
    ]
  },
  {
    id: 4,
    code: 'M04',
    title: 'DHCP Server Otomatis',
    subtitle: 'Layanan Alokasi IP Dinamis',
    description: 'Konfigurasikan Router Utama sebagai DHCP Server agar semua PC client mendapatkan alokasi IP Address secara otomatis tanpa konfigurasi manual.',
    difficulty: 'Sedang',
    xpReward: 2000,
    technicalGuide: '1. Buka CLI Router Utama (bisa via konsol atau klik Router).\n2. Ketik perintah: "enable" -> "configure terminal".\n3. Buat pool DHCP: "ip dhcp pool LAB-TKJ".\n4. Tentukan network: "network 192.168.1.0 255.255.255.0".\n5. Tentukan default router: "default-router 192.168.1.1".\n6. Klik PC-1 dan PC-2, ubah mode konfigurasi IP dari "Static" ke "DHCP".',
    objectives: [
      { id: 'm4_dhcp_router', text: 'Konfigurasi ip dhcp pool LAB-TKJ di Router', completed: false },
      { id: 'm4_pc1_dhcp', text: 'Ubah konfigurasi IP PC-1 menjadi DHCP (Dapat IP Otomatis)', completed: false },
      { id: 'm4_pc2_dhcp', text: 'Ubah konfigurasi IP PC-2 menjadi DHCP (Dapat IP Otomatis)', completed: false }
    ]
  },
  {
    id: 5,
    code: 'M05',
    title: 'Firewall Keamanan ACL',
    subtitle: 'Access Control List (SSH Filter)',
    description: 'Terjadi upaya peretasan brute force SSH (port 22) dari IP luar 10.10.10.50 ke Web Server (192.168.1.100). Buatlah Access Control List (ACL) nomor 101 di Router untuk memblokirnya.',
    difficulty: 'Sulit',
    xpReward: 2500,
    technicalGuide: '1. Buka CLI Router Utama.\n2. Buat aturan ACL: "access-list 101 deny tcp host 10.10.10.50 host 192.168.1.100 eq 22".\n3. Tambahkan izin trafik lain: "access-list 101 permit ip any any".\n4. Masuk ke interface Gi0/0: "interface gigabitethernet 0/0".\n5. Terapkan ACL: "ip access-group 101 in".',
    objectives: [
      { id: 'm5_acl_rules', text: 'Buat aturan ACL 101 untuk blokir TCP port 22 dari 10.10.10.50', completed: false },
      { id: 'm5_acl_permit', text: 'Tambahkan aturan permit ip any any di ACL 101', completed: false },
      { id: 'm5_acl_apply', text: 'Terapkan ACL 101 pada interface Gi0/0 arah masuk (in)', completed: false }
    ]
  },
  {
    id: 6,
    code: 'M06',
    title: 'Routing Statis Default',
    subtitle: 'Menghubungkan ke Jaringan Luar',
    description: 'PC di Lab Jaringan tidak bisa mengakses internet (DNS 8.8.8.8) karena Router Utama belum memiliki Rute Statis Default. Konfigurasikan rute statis menuju gateway ISP luar (10.10.10.1) untuk membuka koneksi internet.',
    difficulty: 'Sedang',
    xpReward: 2200,
    technicalGuide: '1. Buka CLI Router Utama (klik Router Utama, pilih tab CLI CONSOLE).\n2. Masuk ke mode konfigurasi global: ketik "enable", lalu "configure terminal".\n3. Masukkan perintah rute default: "ip route 0.0.0.0 0.0.0.0 10.10.10.1".\n4. Buka PC-1 (Dept HR) -> Desktop -> Command Prompt, lakukan uji koneksi dengan mengetik "ping 8.8.8.8".',
    objectives: [
      { id: 'm6_static_route', text: 'Konfigurasi rute default "ip route 0.0.0.0 0.0.0.0 10.10.10.1" di Router Utama', completed: false },
      { id: 'm6_ping_dns', text: 'Lakukan ping ke 8.8.8.8 dari PC-1 untuk memverifikasi koneksi internet', completed: false }
    ]
  }
];

// ============================================================================
// UTP CRIMPING CONSTANTS & VISUAL STYLING
// ============================================================================
const CRIMP_COLORS = [
  'Putih-Oranye',
  'Oranye',
  'Putih-Hijau',
  'Biru',
  'Putih-Biru',
  'Hijau',
  'Putih-Cokelat',
  'Cokelat'
];

const WIRE_STYLES: { [key: string]: string } = {
  'Putih-Oranye': 'bg-gradient-to-r from-orange-500 via-slate-100 to-orange-500 border border-orange-500/30 text-slate-900',
  'Oranye': 'bg-orange-500 border border-orange-600 text-white',
  'Putih-Hijau': 'bg-gradient-to-r from-green-500 via-slate-100 to-green-500 border border-green-500/30 text-slate-900',
  'Biru': 'bg-blue-600 border border-blue-700 text-white',
  'Putih-Biru': 'bg-gradient-to-r from-blue-600 via-slate-100 to-blue-600 border border-blue-500/30 text-slate-900',
  'Hijau': 'bg-green-600 border border-green-700 text-white',
  'Putih-Cokelat': 'bg-gradient-to-r from-amber-800 via-slate-100 to-amber-800 border border-amber-800/30 text-slate-900',
  'Cokelat': 'bg-amber-900 border border-amber-950 text-white'
};

// ============================================================================
// APP ENTRY POINT
// ============================================================================
export default function App() {
  // Game state
  const [showWelcomeSplash, setShowWelcomeSplash] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<'lobby' | 'game' | 'handbook'>('lobby');
  const [xp, setXp] = useState<number>(0);
  const [unlockedMissions, setUnlockedMissions] = useState<number[]>([1]);
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  
  // Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successModalData, setSuccessModalData] = useState<{ id: number, title: string, xpReward: number } | null>(null);
  
  // Audio chime helpers
  const playSound = (type: 'click' | 'success' | 'fail' | 'connect') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'connect') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'fail') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // AudioContext fails gracefully if browser blocks it
    }
  };

  // Load progress from localStorage
  useEffect(() => {
    const savedXp = localStorage.getItem('gamejar_xp');
    const savedCompleted = localStorage.getItem('gamejar_completed');
    const savedUnlocked = localStorage.getItem('gamejar_unlocked');
    if (savedXp) setXp(parseInt(savedXp));
    if (savedCompleted) setCompletedMissions(JSON.parse(savedCompleted));
    if (savedUnlocked) setUnlockedMissions(JSON.parse(savedUnlocked));
  }, []);

  const saveProgress = (newXp: number, newComp: number[], newUnl: number[]) => {
    localStorage.setItem('gamejar_xp', newXp.toString());
    localStorage.setItem('gamejar_completed', JSON.stringify(newComp));
    localStorage.setItem('gamejar_unlocked', JSON.stringify(newUnl));
  };

  const level = Math.floor(xp / 1000) + 1;

  // Simulator Network States
  const [connections, setConnections] = useState<Array<{from: string, fromPort: string, to: string, toPort: string, type: 'utp' | 'console'}>>([]);
  const [pc1Ip, setPc1Ip] = useState({ ip: '', mask: '', gw: '', dns: '', mode: 'static' as 'static' | 'dhcp' });
  const [pc2Ip, setPc2Ip] = useState({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' as 'static' | 'dhcp' });
  const [pc3Ip, setPc3Ip] = useState({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' as 'static' | 'dhcp' }); // IP conflict default
  const [laptopIp, setLaptopIp] = useState({ ip: '192.168.1.5', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' as 'static' | 'dhcp' });
  
  // CLI States (Switch/Router Console)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [currentCliTarget, setCurrentCliTarget] = useState<'switch' | 'router' | null>(null);
  const [cliMode, setCliMode] = useState<'user' | 'priv' | 'conf' | 'interface' | 'dhcp' | 'vlan'>('user');
  const [cliSubTarget, setCliSubTarget] = useState<string>(''); // For interfaces like fa0/3, gi0/0
  const [cliInput, setCliInput] = useState('');
  
  // PC Interface overlays
  const [openedPcId, setOpenedPcId] = useState<'pc1' | 'pc2' | 'pc3' | 'laptop' | null>(null);
  const [pcTab, setPcTab] = useState<'config' | 'desktop' | 'web'>('config');
  
  // Switch & Router Dialog overlays
  const [openedSwitchId, setOpenedSwitchId] = useState<boolean>(false);
  const [openedRouterId, setOpenedRouterId] = useState<boolean>(false);
  const [switchTab, setSwitchTab] = useState<'vlan' | 'cli'>('vlan');
  const [routerTab, setRouterTab] = useState<'dhcp' | 'acl' | 'cli'>('dhcp');
  
  // Visual config input states
  const [vlanIdInput, setVlanIdInput] = useState('');
  const [vlanNameInput, setVlanNameInput] = useState('');
  const [dhcpPoolNameInput, setDhcpPoolNameInput] = useState('LAB-TKJ');
  const [dhcpNetworkInput, setDhcpNetworkInput] = useState('192.168.1.0');
  const [dhcpGatewayInput, setDhcpGatewayInput] = useState('192.168.1.1');
  const [aclSourceInput, setAclSourceInput] = useState('10.10.10.50');
  const [aclDestInput, setAclDestInput] = useState('192.168.1.100');
  const [pcPromptLogs, setPcPromptLogs] = useState<{ [key: string]: string[] }>({
    pc1: ['GAMEJar Client Console v1.0', 'Ketik "help" untuk melihat daftar perintah.', ''],
    pc2: ['GAMEJar Client Console v1.0', 'Ketik "help" untuk melihat daftar perintah.', ''],
    pc3: ['GAMEJar Client Console v1.0', 'Ketik "help" untuk melihat daftar perintah.', ''],
    laptop: ['GAMEJar Client Console v1.0', 'Ketik "help" untuk melihat daftar perintah.', '']
  });
  const [pcPromptInput, setPcPromptInput] = useState('');
  const [webBrowserUrl, setWebBrowserUrl] = useState('http://tkj-server.net');

  // Switch Port mapping state
  const [switchVlans, setSwitchVlans] = useState<{ [port: string]: number }>({
    'Fa0/1': 1, 'Fa0/2': 1, 'Fa0/3': 1, 'Fa0/4': 1, 'Fa0/5': 1, 'Fa0/6': 1, 'Fa0/7': 1, 'Fa0/8': 1
  });
  const [switchCreatedVlans, setSwitchCreatedVlans] = useState<number[]>([1]);

  // Terminal Collapse state
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState<boolean>(true);

  // UTP Crimping Mini-game states
  const [isCrimpingOpen, setIsCrimpingOpen] = useState<boolean>(false);
  const [crimpPins, setCrimpPins] = useState<string[]>(['', '', '', '', '', '', '', '']);
  const [selectedWireColor, setSelectedWireColor] = useState<string | null>(null);
  const [isCrimpingSuccess, setIsCrimpingSuccess] = useState<boolean>(false);
  const [crimpingError, setCrimpingError] = useState<string | null>(null);

  // Draggable Connections Widget states
  const [connectionsWidgetPos, setConnectionsWidgetPos] = useState({ x: 16, y: 16 }); // offset from right: 16px, top: 16px
  const [isDraggingConnections, setIsDraggingConnections] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, widgetX: 0, widgetY: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    // Only allow dragging when left click is used
    if (e.button !== 0) return;
    setIsDraggingConnections(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      widgetX: connectionsWidgetPos.x,
      widgetY: connectionsWidgetPos.y
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingConnections) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      
      // Since it is positioned from 'right' and 'top', moving mouse right (dx > 0) decreases 'right' position.
      // Moving mouse down (dy > 0) increases 'top' position.
      setConnectionsWidgetPos({
        x: Math.max(0, dragStartRef.current.widgetX - dx),
        y: Math.max(0, dragStartRef.current.widgetY + dy)
      });
    };

    const handleMouseUp = () => {
      setIsDraggingConnections(false);
    };

    if (isDraggingConnections) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingConnections]);

  // Synchronize cli target when modal is opened
  useEffect(() => {
    if (openedSwitchId) {
      setCurrentCliTarget('switch');
    }
  }, [openedSwitchId]);

  useEffect(() => {
    if (openedRouterId) {
      setCurrentCliTarget('router');
    }
  }, [openedRouterId]);

  // Synchronize terminal collapse state when cli target changes
  useEffect(() => {
    if (currentCliTarget) {
      setIsTerminalCollapsed(false);
    } else {
      setIsTerminalCollapsed(true);
    }
  }, [currentCliTarget]);

  // Router config state
  const [routerDhcpPool, setRouterDhcpPool] = useState({ active: false, network: '', gateway: '' });
  const [routerAcl, setRouterAcl] = useState<Array<{ type: 'deny' | 'permit', src: string, dst: string, port?: number }>>([]);
  const [routerAclApplied, setRouterAclApplied] = useState<{ interface: string, direction: 'in' | 'out' } | null>(null);
  const [routerStaticRoute, setRouterStaticRoute] = useState<string | null>(null);

  // AI Assistant Chat state
  const [aiChat, setAiChat] = useState<Array<{ sender: 'user' | 'assistant', text: string }>>([
    { sender: 'assistant', text: 'Halo! Saya Instruktur Jar, pemandu praktikum jaringan komputer Anda. Ada yang bisa saya bantu terkait materi TKJ atau misi praktikum saat ini?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Active Tool state
  const [selectedTool, setSelectedTool] = useState<'utp' | 'console' | null>(null);
  const [wireStartNode, setWireStartNode] = useState<{ device: string, port: string } | null>(null);

  // Dynamic live metric counters
  const [metrics, setMetrics] = useState({ traffic: 250, latency: 12, loss: 0 });

  // References
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const pcPromptBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of terminal when logs update
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  useEffect(() => {
    pcPromptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pcPromptLogs, openedPcId]);

  const handleNextMission = () => {
    if (!successModalData) return;
    const nextId = successModalData.id + 1;
    const nextMission = MISSIONS_DATA.find(m => m.id === nextId);
    
    setShowSuccessModal(false);
    setSuccessModalData(null);
    
    if (nextMission) {
      playSound('click');
      setActiveMission(nextMission);
      initializeMissionState(nextMission.id);
      setCurrentScreen('game');
    } else {
      // Completed all missions! Go to lobby
      playSound('success');
      setCurrentScreen('lobby');
      setActiveMission(null);
    }
  };

  const initializeMissionState = (missionId: number) => {
    // Clear old states
    setConnections([]);
    setCurrentCliTarget(null);
    setCliMode('user');
    setCliSubTarget('');
    setCliInput('');
    setOpenedPcId(null);
    setSwitchVlans({
      'Fa0/1': 1, 'Fa0/2': 1, 'Fa0/3': 1, 'Fa0/4': 1, 'Fa0/5': 1, 'Fa0/6': 1, 'Fa0/7': 1, 'Fa0/8': 1
    });
    setSwitchCreatedVlans([1]);
    setRouterDhcpPool({ active: false, network: '', gateway: '' });
    setRouterAcl([]);
    setRouterAclApplied(null);
    setRouterStaticRoute(null);
    setCrimpPins(['', '', '', '', '', '', '', '']);
    setSelectedWireColor(null);
    setIsCrimpingSuccess(false);

    // Initial terminal logs
    const initialLogs = [
      `🚀 [SYSTEM] Memulai Simulasi Misi ${missionId}...`,
      `⚙️ Menyiapkan perangkat laboratorium virtual...`,
    ];

    if (missionId === 1) {
      setConnections([
        { from: 'router', fromPort: 'Gi0/0', to: 'switch', toPort: 'Fa0/8', type: 'utp' },
        { from: 'pc2', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/2', type: 'utp' },
        { from: 'pc3', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/3', type: 'utp' }
      ]);
      setPc1Ip({ ip: '', mask: '', gw: '', dns: '', mode: 'static' });
      setPc2Ip({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc3Ip({ ip: '192.168.1.11', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setLaptopIp({ ip: '192.168.1.5', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setTerminalLogs([
        ...initialLogs,
        `✅ Perangkat PC-2, PC-3, dan Router Utama berhasil dinyalakan dan dihubungkan ke Switch.`,
        `👉 PC-1 belum memiliki koneksi kabel dan alamat IP. Hubungkan sekarang!`
      ]);
    } else if (missionId === 2) {
      setConnections([
        { from: 'router', fromPort: 'Gi0/0', to: 'switch', toPort: 'Fa0/8', type: 'utp' },
        { from: 'pc1', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/1', type: 'utp' },
        { from: 'pc2', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/2', type: 'utp' },
        { from: 'pc3', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/3', type: 'utp' }
      ]);
      setPc1Ip({ ip: '192.168.1.2', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc2Ip({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc3Ip({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' }); // Conflict!
      setLaptopIp({ ip: '192.168.1.5', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setTerminalLogs([
        ...initialLogs,
        `⚠️ DETEKSI ADANYA KONFLIK ALAMAT IP: PC-2 dan PC-3 menggunakan IP yang sama (192.168.1.10)!`,
        `👉 Silakan ubah IP PC-3 menjadi 192.168.1.11 di Tab Konfigurasi IP untuk menyelesaikan konflik.`
      ]);
    } else if (missionId === 3) {
      setConnections([
        { from: 'router', fromPort: 'Gi0/0', to: 'switch', toPort: 'Fa0/8', type: 'utp' },
        { from: 'pc1', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/1', type: 'utp' },
        { from: 'pc2', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/2', type: 'utp' },
        { from: 'pc3', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/3', type: 'utp' }
      ]);
      setPc1Ip({ ip: '192.168.1.2', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc2Ip({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc3Ip({ ip: '192.168.1.11', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setLaptopIp({ ip: '192.168.1.5', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setTerminalLogs([
        ...initialLogs,
        `🔌 Seluruh PC Klien sudah terhubung ke Switch.`,
        `👉 Hubungkan kabel Console hitam dari Laptop Admin (RS232) ke Switch (Console) terlebih dahulu untuk mengonfigurasi VLAN.`
      ]);
    } else if (missionId === 4) {
      setConnections([
        { from: 'router', fromPort: 'Gi0/0', to: 'switch', toPort: 'Fa0/8', type: 'utp' },
        { from: 'pc1', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/1', type: 'utp' },
        { from: 'pc2', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/2', type: 'utp' },
        { from: 'pc3', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/3', type: 'utp' }
      ]);
      setPc1Ip({ ip: '', mask: '', gw: '', dns: '', mode: 'static' });
      setPc2Ip({ ip: '', mask: '', gw: '', dns: '', mode: 'static' });
      setPc3Ip({ ip: '192.168.1.11', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setLaptopIp({ ip: '192.168.1.5', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setTerminalLogs([
        ...initialLogs,
        `💻 Perangkat PC-1 dan PC-2 belum terkonfigurasi IP Addressnya (0.0.0.0).`,
        `👉 Konfigurasikan DHCP Pool di Router Utama via CLI, lalu ubah mode IP PC-1 dan PC-2 ke DHCP.`
      ]);
    } else if (missionId === 5) {
      setConnections([
        { from: 'router', fromPort: 'Gi0/0', to: 'switch', toPort: 'Fa0/8', type: 'utp' },
        { from: 'pc1', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/1', type: 'utp' },
        { from: 'pc2', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/2', type: 'utp' },
        { from: 'pc3', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/3', type: 'utp' }
      ]);
      setPc1Ip({ ip: '192.168.1.2', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc2Ip({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc3Ip({ ip: '192.168.1.11', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setLaptopIp({ ip: '192.168.1.5', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setTerminalLogs([
        ...initialLogs,
        `🚨 PERINGATAN KEAMANAN: Terdeteksi upaya brute-force SSH (Port 22) dari IP luar 10.10.10.50!`,
        `👉 Konfigurasikan aturan Access Control List (ACL) nomor 101 pada Router Utama untuk memblokirnya.`
      ]);
    } else if (missionId === 6) {
      setConnections([
        { from: 'router', fromPort: 'Gi0/0', to: 'switch', toPort: 'Fa0/8', type: 'utp' },
        { from: 'pc1', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/1', type: 'utp' },
        { from: 'pc2', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/2', type: 'utp' },
        { from: 'pc3', fromPort: 'Eth0', to: 'switch', toPort: 'Fa0/3', type: 'utp' }
      ]);
      setPc1Ip({ ip: '192.168.1.2', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc2Ip({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setPc3Ip({ ip: '192.168.1.11', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setLaptopIp({ ip: '192.168.1.5', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'static' });
      setTerminalLogs([
        ...initialLogs,
        `🌐 KONEKSI INTERNET TERPUTUS: PC Klien tidak dapat berkomunikasi ke jaringan luar (8.8.8.8).`,
        `👉 Masuk ke Router CLI, lalu tambahkan rute statis default: "ip route 0.0.0.0 0.0.0.0 10.10.10.1".`,
        `👉 Setelah itu, lakukan uji ping ke 8.8.8.8 dari Terminal PC-1!`
      ]);
    }
  };

  // Handle active DHCP changes for PCs
  useEffect(() => {
    if (activeMission?.id === 4 && routerDhcpPool.active) {
      if (pc1Ip.mode === 'dhcp') {
        setPc1Ip({ ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'dhcp' });
      }
      if (pc2Ip.mode === 'dhcp') {
        setPc2Ip({ ip: '192.168.1.12', mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8', mode: 'dhcp' });
      }
    }
  }, [pc1Ip.mode, pc2Ip.mode, routerDhcpPool]);

  // Live performance metric changes simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const isConflict = pc2Ip.ip === pc3Ip.ip && pc2Ip.ip !== '';
        const isM5Blocked = routerAclApplied?.interface === 'Gi0/0' && routerAcl.some(a => a.type === 'deny' && a.port === 22);
        
        return {
          traffic: Math.floor(Math.random() * 200) + (isConflict ? 10 : 350),
          latency: isConflict ? Math.floor(Math.random() * 400) + 120 : Math.floor(Math.random() * 8) + 10,
          loss: isConflict ? parseFloat((Math.random() * 5 + 4).toFixed(2)) : (isM5Blocked ? 0.05 : 0)
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [pc2Ip.ip, pc3Ip.ip, routerAclApplied, routerAcl]);

  // ============================================================================
  // MISSION PROGRESS VALIDATOR ENGINE
  // ============================================================================
  useEffect(() => {
    if (!activeMission) return;

    let updatedObjectives = activeMission.objectives.map(o => ({ ...o }));
    let stateChanged = false;

    // Mission 1: Konektivitas Dasar
    if (activeMission.id === 1) {
      // Obj 0: Crimping UTP T568B
      const isCrimped = isCrimpingSuccess;
      const crimpObj = updatedObjectives.find(o => o.id === 'm1_crimping');
      if (crimpObj && crimpObj.completed !== isCrimped) {
        crimpObj.completed = isCrimped;
        stateChanged = true;
      }

      // Obj 1: PC-1 to Switch port Fa0/1 UTP
      const hasCable = connections.some(c => 
        ((c.from === 'pc1' && c.to === 'switch' && c.toPort === 'Fa0/1') || 
         (c.to === 'pc1' && c.from === 'switch' && c.fromPort === 'Fa0/1')) && c.type === 'utp'
      );
      const cableObj = updatedObjectives.find(o => o.id === 'm1_cable');
      if (cableObj && cableObj.completed !== hasCable) {
        cableObj.completed = hasCable;
        stateChanged = true;
      }

      // Obj 2: Config IP PC-1
      const isIpSet = pc1Ip.ip === '192.168.1.2' && pc1Ip.mask === '255.255.255.0' && pc1Ip.gw === '192.168.1.1';
      const ipObj = updatedObjectives.find(o => o.id === 'm1_ip');
      if (ipObj && ipObj.completed !== isIpSet) {
        ipObj.completed = isIpSet;
        stateChanged = true;
      }
    }

    // Mission 2: IP Conflict
    if (activeMission.id === 2) {
      // Obj 1: Change PC-3 IP to 192.168.1.11
      const isIpCorrect = pc3Ip.ip === '192.168.1.11';
      if (isIpCorrect !== updatedObjectives[0].completed) {
        updatedObjectives[0].completed = isIpCorrect;
        stateChanged = true;
      }

      // Obj 2 verified when ping 192.168.1.1 is run on PC-3
    }

    // Mission 3: VLAN Segregation
    if (activeMission.id === 3) {
      // Obj 1: Console cable from laptop to switch
      const hasConsole = connections.some(c => 
        ((c.from === 'laptop' && c.fromPort === 'RS232' && c.to === 'switch' && c.toPort === 'Console') ||
         (c.to === 'laptop' && c.toPort === 'RS232' && c.from === 'switch' && c.fromPort === 'Console')) && c.type === 'console'
      );
      if (hasConsole !== updatedObjectives[0].completed) {
        updatedObjectives[0].completed = hasConsole;
        stateChanged = true;
      }

      // Obj 2: Created VLAN 10 & 20
      const hasVlans = switchCreatedVlans.includes(10) && switchCreatedVlans.includes(20);
      if (hasVlans !== updatedObjectives[1].completed) {
        updatedObjectives[1].completed = hasVlans;
        stateChanged = true;
      }

      // Obj 3: Alokasikan Port
      const isPortsAssigned = switchVlans['Fa0/1'] === 10 && switchVlans['Fa0/2'] === 10 &&
                               switchVlans['Fa0/3'] === 20 && switchVlans['Fa0/4'] === 20;
      if (isPortsAssigned !== updatedObjectives[2].completed) {
        updatedObjectives[2].completed = isPortsAssigned;
        stateChanged = true;
      }
    }

    // Mission 4: DHCP Server Otomatis
    if (activeMission.id === 4) {
      // Obj 1: Router configured pool
      const isDhcpActive = routerDhcpPool.active && routerDhcpPool.network === '192.168.1.0' && routerDhcpPool.gateway === '192.168.1.1';
      if (isDhcpActive !== updatedObjectives[0].completed) {
        updatedObjectives[0].completed = isDhcpActive;
        stateChanged = true;
      }

      // Obj 2: PC-1 mode DHCP
      const pc1DhcpMode = pc1Ip.mode === 'dhcp';
      if (pc1DhcpMode !== updatedObjectives[1].completed) {
        updatedObjectives[1].completed = pc1DhcpMode;
        stateChanged = true;
      }

      // Obj 3: PC-2 mode DHCP
      const pc2DhcpMode = pc2Ip.mode === 'dhcp';
      if (pc2DhcpMode !== updatedObjectives[2].completed) {
        updatedObjectives[2].completed = pc2DhcpMode;
        stateChanged = true;
      }
    }

    // Mission 5: Security ACL
    if (activeMission.id === 5) {
      // Obj 1: Deny rule
      const hasDeny = routerAcl.some(a => a.type === 'deny' && a.src === '10.10.10.50' && a.port === 22);
      if (hasDeny !== updatedObjectives[0].completed) {
        updatedObjectives[0].completed = hasDeny;
        stateChanged = true;
      }

      // Obj 2: Permit all rule
      const hasPermit = routerAcl.some(a => a.type === 'permit' && a.src === 'any' && a.dst === 'any');
      if (hasPermit !== updatedObjectives[1].completed) {
        updatedObjectives[1].completed = hasPermit;
        stateChanged = true;
      }

      // Obj 3: Apply ACL 101 to Gi0/0 in
      const isApplied = routerAclApplied?.interface === 'Gi0/0' && routerAclApplied?.direction === 'in';
      if (isApplied !== updatedObjectives[2].completed) {
        updatedObjectives[2].completed = isApplied;
        stateChanged = true;
      }
    }

    // Mission 6: Static Routing
    if (activeMission.id === 6) {
      // Obj 1: Static default route set
      const isRouteSet = routerStaticRoute === '10.10.10.1';
      if (isRouteSet !== updatedObjectives[0].completed) {
        updatedObjectives[0].completed = isRouteSet;
        stateChanged = true;
      }
    }

    if (stateChanged) {
      setActiveMission(prev => {
        if (!prev || prev.id !== activeMission.id) return prev;
        const merged = prev.objectives.map((obj, i) => {
          // If this objective is managed by the validator for this mission, update it.
          // Otherwise, preserve its current state in prev.
          let shouldUpdate = false;
          if (prev.id === 1 && (obj.id === 'm1_crimping' || obj.id === 'm1_cable' || obj.id === 'm1_ip')) shouldUpdate = true;
          if (prev.id === 2 && obj.id === 'm2_change_ip') shouldUpdate = true;
          if (prev.id === 3) shouldUpdate = true;
          if (prev.id === 4) shouldUpdate = true;
          if (prev.id === 5) shouldUpdate = true;
          if (prev.id === 6 && obj.id === 'm6_static_route') shouldUpdate = true;

          return {
            ...obj,
            completed: shouldUpdate ? updatedObjectives[i].completed : obj.completed
          };
        });
        return { ...prev, objectives: merged };
      });
    }
  }, [connections, pc1Ip, pc2Ip, pc3Ip, switchVlans, switchCreatedVlans, routerDhcpPool, routerAcl, routerAclApplied, routerStaticRoute, activeMission]);

  // ============================================================================
  // MISSION ACCOMPLISHED DETECTOR
  // ============================================================================
  useEffect(() => {
    if (!activeMission) return;

    const allCompleted = activeMission.objectives.every(o => o.completed);
    if (allCompleted && !completedMissions.includes(activeMission.id)) {
      playSound('success');
      const nextXp = xp + activeMission.xpReward;
      setXp(nextXp);

      const nextCompleted = [...completedMissions];
      if (!nextCompleted.includes(activeMission.id)) {
        nextCompleted.push(activeMission.id);
      }
      setCompletedMissions(nextCompleted);

      const nextUnlocked = [...unlockedMissions];
      const nextId = activeMission.id + 1;
      if (nextId <= MISSIONS_DATA.length && !nextUnlocked.includes(nextId)) {
        nextUnlocked.push(nextId);
      }
      setUnlockedMissions(nextUnlocked);
      saveProgress(nextXp, nextCompleted, nextUnlocked);

      // Notify client in terminal
      setTerminalLogs(prev => [
        ...prev,
        `\n🏆 [MISI SELESAI] Selamat! Anda berhasil menyelesaikan ${activeMission.title}!`,
        `✨ Hadiah XP: +${activeMission.xpReward} XP. Total XP Anda sekarang: ${nextXp} XP.`
      ]);

      // Open Success Modal
      setSuccessModalData({
        id: activeMission.id,
        title: activeMission.title,
        xpReward: activeMission.xpReward
      });
      setShowSuccessModal(true);
    }
  }, [activeMission, completedMissions, xp, unlockedMissions]);

  // ============================================================================
  // UTP CABLE CRIMPING ACTIONS
  // ============================================================================
  const handleSelectWire = (color: string) => {
    playSound('click');
    setSelectedWireColor(color);
  };

  const handleSlotClick = (slotIdx: number) => {
    playSound('click');
    setCrimpingError(null);
    if (!selectedWireColor) {
      // If no wire selected, click to clear current wire from slot
      const existingColor = crimpPins[slotIdx];
      if (existingColor) {
        const nextPins = [...crimpPins];
        nextPins[slotIdx] = '';
        setCrimpPins(nextPins);
      }
      return;
    }

    // Assign selected wire to this slot
    const nextPins = [...crimpPins];
    
    // If the selected wire was already in another slot, clear that slot first
    const existingIndex = crimpPins.indexOf(selectedWireColor);
    if (existingIndex !== -1) {
      nextPins[existingIndex] = '';
    }

    // Place selected wire in slot
    nextPins[slotIdx] = selectedWireColor;
    setCrimpPins(nextPins);
    setSelectedWireColor(null); // Deselect after placing
  };

  const handleVerifyCrimping = () => {
    // Standard T568B Straight order
    const correctOrder = [
      'Putih-Oranye',
      'Oranye',
      'Putih-Hijau',
      'Biru',
      'Putih-Biru',
      'Hijau',
      'Putih-Cokelat',
      'Cokelat'
    ];

    // Check if any slot is still empty
    if (crimpPins.some(pin => !pin)) {
      playSound('fail');
      setCrimpingError('Semua 8 PIN kawat RJ-45 harus terpasang kawat sebelum di-crimp!');
      return;
    }

    const isMatch = crimpPins.every((val, idx) => val === correctOrder[idx]);

    if (isMatch) {
      playSound('success');
      setIsCrimpingSuccess(true);
      setCrimpingError(null);
      setTerminalLogs(prev => [
        ...prev,
        `✨ [CRIMPING] Crimping kabel UTP berhasil! Susunan warna T568B Straight sempurna.`,
        `👉 Sekarang hubungkan PC-1 (Eth0) ke Switch (Fa0/1) menggunakan kabel UTP yang baru selesai di-crimp!`
      ]);
      // Update active mission state
      setActiveMission(prev => {
        if (prev?.id === 1) {
          const updated = prev.objectives.map(o => o.id === 'm1_crimping' ? { ...o, completed: true } : o);
          return { ...prev, objectives: updated };
        }
        return prev;
      });
    } else {
      playSound('fail');
      setIsCrimpingSuccess(false);
      setCrimpingError('Susunan kawat salah! Harap periksa kembali urutan pin standar T568B Straight.');
    }
  };

  // ============================================================================
  // INTERACTIVE CABLING ENGINE
  // ============================================================================
  const handlePortClick = (device: string, port: string) => {
    playSound('click');
    if (!selectedTool) return;

    if (selectedTool === 'utp' && activeMission?.id === 1 && !isCrimpingSuccess) {
      playSound('fail');
      setTerminalLogs(prev => [
        ...prev, 
        `⚠️ [CABLING] Gagal! Kabel UTP belum di-crimping dengan benar. Silakan selesaikan tugas "Crimping UTP" di panel Misi sebelah kiri untuk merakit susunan warna kabel T568B Straight.`
      ]);
      setSelectedTool(null);
      setWireStartNode(null);
      return;
    }

    if (!wireStartNode) {
      // Start connection
      setWireStartNode({ device, port });
      setTerminalLogs(prev => [...prev, `⚡ [CABLING] Menarik ujung kabel ${selectedTool.toUpperCase()} dari ${device.toUpperCase()} (${port}). Klik port tujuan...`]);
    } else {
      // Prevent connecting to same device
      if (wireStartNode.device === device) {
        setWireStartNode(null);
        setSelectedTool(null);
        playSound('fail');
        setTerminalLogs(prev => [...prev, `❌ [CABLING] Batal. Tidak bisa menghubungkan ke port pada perangkat yang sama.`]);
        return;
      }

      // Complete connection
      const newConnection = {
        from: wireStartNode.device,
        fromPort: wireStartNode.port,
        to: device,
        toPort: port,
        type: selectedTool
      };

      setConnections(prev => [...prev, newConnection]);
      playSound('connect');
      setTerminalLogs(prev => [...prev, `✅ [CABLING] Terhubung: ${wireStartNode.device.toUpperCase()} [${wireStartNode.port}] ───[${selectedTool.toUpperCase()}]───> ${device.toUpperCase()} [${port}]`]);
      setWireStartNode(null);
      setSelectedTool(null);
    }
  };

  const removeConnection = (index: number) => {
    playSound('fail');
    const removed = connections[index];
    setConnections(prev => prev.filter((_, i) => i !== index));
    setTerminalLogs(prev => [...prev, `🗑️ [CABLING] Kabel dilepas dari ${removed.from.toUpperCase()} [${removed.fromPort}] <---> ${removed.to.toUpperCase()} [${removed.toPort}]`]);
  };

  // ============================================================================
  // CISCO IOS CLI PARSER ENGINE (Switch & Router)
  // ============================================================================
  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim();
    const cmdLower = cmd.toLowerCase();
    setCliInput('');

    // Print command entered
    const promptChar = cliMode === 'user' ? '>' : '#';
    let promptPrefix = currentCliTarget === 'switch' ? 'Switch' : 'Router';
    if (cliMode === 'conf') promptPrefix += '(config)';
    else if (cliMode === 'interface') promptPrefix += `(config-if)`;
    else if (cliMode === 'dhcp') promptPrefix += `(config-dhcp)`;
    else if (cliMode === 'vlan') promptPrefix += `(config-vlan)`;

    const echoLine = `${promptPrefix}${promptChar} ${cmd}`;
    let output: string[] = [echoLine];

    // Parser implementation
    if (cmdLower === 'enable' || cmdLower === 'ena') {
      if (cliMode === 'user') {
        setCliMode('priv');
        output.push(`[SYSTEM] Privileged EXEC mode activated.`);
      } else {
        output.push(`% Mode already enabled.`);
      }
    } else if (cmdLower === 'exit') {
      if (cliMode === 'vlan' || cliMode === 'interface' || cliMode === 'dhcp') {
        setCliMode('conf');
      } else if (cliMode === 'conf') {
        setCliMode('priv');
      } else if (cliMode === 'priv') {
        setCliMode('user');
      } else {
        output.push(`% Terminal connection ended.`);
      }
    } else if (cmdLower === 'configure terminal' || cmdLower === 'conf t') {
      if (cliMode === 'priv') {
        setCliMode('conf');
        output.push(`Enter configuration commands, one per line. End with CNTL/Z.`);
      } else {
        output.push(`% Must be in privileged mode first. Type 'enable'.`);
      }
    } else if (cmdLower.startsWith('interface ') || cmdLower.startsWith('int ')) {
      if (cliMode === 'conf') {
        const portStr = cmdLower.split(' ').pop() || '';
        if (currentCliTarget === 'switch') {
          // Switch port FastEthernet0/1 etc
          setCliMode('interface');
          setCliSubTarget(portStr);
          output.push(`Entering configuration mode for Switch interface ${portStr}.`);
        } else {
          // Router port GigabitEthernet0/0 etc
          setCliMode('interface');
          setCliSubTarget(portStr);
          output.push(`Entering configuration mode for Router interface ${portStr}.`);
        }
      } else {
        output.push(`% Command rejected. Configure mode required.`);
      }
    } else if (cmdLower.startsWith('vlan ')) {
      if (cliMode === 'conf' && currentCliTarget === 'switch') {
        const vlanId = parseInt(cmdLower.split(' ').pop() || '1');
        if (!isNaN(vlanId)) {
          setCliMode('vlan');
          setCliSubTarget(vlanId.toString());
          if (!switchCreatedVlans.includes(vlanId)) {
            setSwitchCreatedVlans(prev => [...prev, vlanId]);
          }
          output.push(`VLAN ${vlanId} created / selected.`);
        }
      } else {
        output.push(`% Command invalid or not in Config mode on Switch.`);
      }
    } else if (cmdLower.startsWith('switchport access vlan ')) {
      if (cliMode === 'interface' && currentCliTarget === 'switch') {
        const vlanId = parseInt(cmdLower.split(' ').pop() || '1');
        if (!isNaN(vlanId)) {
          // Find standard format port
          const formattedPort = cliSubTarget.includes('/') 
            ? cliSubTarget.split('/').pop()?.toUpperCase() 
            : cliSubTarget.toUpperCase();
          const targetPortKey = `Fa0/${formattedPort || '1'}`;
          
          setSwitchVlans(prev => ({ ...prev, [targetPortKey]: vlanId }));
          output.push(`Interface ${cliSubTarget} assigned to VLAN ${vlanId}.`);
        }
      } else {
        output.push(`% Command rejected. Must be in interface configuration mode.`);
      }
    } else if (cmdLower.startsWith('ip dhcp pool ')) {
      if (cliMode === 'conf' && currentCliTarget === 'router') {
        const poolName = cmd.split(' ').pop() || 'POOL';
        setCliMode('dhcp');
        setCliSubTarget(poolName);
        setRouterDhcpPool(prev => ({ ...prev, active: true }));
        output.push(`DHCP Pool "${poolName}" initialized.`);
      } else {
        output.push(`% Command invalid or not in config mode on Router.`);
      }
    } else if (cmdLower.startsWith('network ')) {
      if (cliMode === 'dhcp' && currentCliTarget === 'router') {
        const parts = cmd.split(' ');
        const net = parts[1];
        setRouterDhcpPool(prev => ({ ...prev, network: net }));
        output.push(`DHCP network set to: ${net}`);
      } else {
        output.push(`% Command rejected. DHCP Config mode required.`);
      }
    } else if (cmdLower.startsWith('default-router ')) {
      if (cliMode === 'dhcp' && currentCliTarget === 'router') {
        const gw = cmd.split(' ').pop() || '';
        setRouterDhcpPool(prev => ({ ...prev, gateway: gw }));
        output.push(`DHCP default router set to: ${gw}`);
      } else {
        output.push(`% Command rejected. DHCP Config mode required.`);
      }
    } else if (cmdLower.startsWith('access-list ')) {
      if (cliMode === 'conf' && currentCliTarget === 'router') {
        // Simple ACL parser for Mission 5:
        // "access-list 101 deny tcp host 10.10.10.50 host 192.168.1.100 eq 22"
        if (cmdLower.includes('deny') && cmdLower.includes('22')) {
          setRouterAcl(prev => [...prev, { type: 'deny', src: '10.10.10.50', dst: '192.168.1.100', port: 22 }]);
          output.push(`Router ACL Rule: Deny TCP from 10.10.10.50 to 192.168.1.100 Port 22 (SSH) added.`);
        } else if (cmdLower.includes('permit') && cmdLower.includes('any')) {
          setRouterAcl(prev => [...prev, { type: 'permit', src: 'any', dst: 'any' }]);
          output.push(`Router ACL Rule: Permit IP any any added.`);
        } else {
          output.push(`Router Access-list parsed but unsupported in simulation rules.`);
        }
      } else {
        output.push(`% Command rejected. Must be in config mode.`);
      }
    } else if (cmdLower.startsWith('ip access-group ')) {
      if (cliMode === 'interface' && currentCliTarget === 'router') {
        const parts = cmdLower.split(' ');
        const aclNum = parts[2];
        const dir = parts[3] as 'in' | 'out';
        setRouterAclApplied({ interface: cliSubTarget, direction: dir });
        output.push(`Applied Access-list ${aclNum} (${dir}) on interface ${cliSubTarget}.`);
      } else {
        output.push(`% Command rejected. Must be in interface mode.`);
      }
    } else if (cmdLower.startsWith('ip route ')) {
      if (cliMode === 'conf' && currentCliTarget === 'router') {
        const parts = cmdLower.split(/\s+/);
        if (parts[2] === '0.0.0.0' && parts[3] === '0.0.0.0' && parts[4] === '10.10.10.1') {
          setRouterStaticRoute('10.10.10.1');
          output.push(`Router(config)# ip route 0.0.0.0 0.0.0.0 10.10.10.1`);
          output.push(`% Static default route configured successfully.`);
        } else {
          output.push(`% Invalid static route command parameters. Use "ip route 0.0.0.0 0.0.0.0 10.10.10.1" for the default ISP gateway.`);
        }
      } else {
        output.push(`% Command rejected. Must be in config mode on Router.`);
      }
    } else if (cmdLower === 'show vlan' || cmdLower === 'show vlan brief') {
      if (currentCliTarget === 'switch') {
        output.push(`
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/5, Fa0/6, Fa0/7, Fa0/8
10   HR                               active    ${switchVlans['Fa0/1'] === 10 ? 'Fa0/1, ' : ''}${switchVlans['Fa0/2'] === 10 ? 'Fa0/2' : ''}
20   Finance                          active    ${switchVlans['Fa0/3'] === 20 ? 'Fa0/3, ' : ''}${switchVlans['Fa0/4'] === 20 ? 'Fa0/4' : ''}
`);
      } else {
        output.push(`% Invalid command on Router.`);
      }
    } else if (cmdLower === 'show running-config' || cmdLower === 'show run') {
      if (currentCliTarget === 'switch') {
        output.push(`
! Current Switch configuration:
vlan 10
 name HR
vlan 20
 name Finance
!
interface FastEthernet0/1
 switchport access vlan ${switchVlans['Fa0/1']}
!
interface FastEthernet0/2
 switchport access vlan ${switchVlans['Fa0/2']}
!
interface FastEthernet0/3
 switchport access vlan ${switchVlans['Fa0/3']}
!
interface FastEthernet0/4
 switchport access vlan ${switchVlans['Fa0/4']}
`);
      } else {
        output.push(`
! Current Router configuration:
ip dhcp pool LAB-TKJ
 network ${routerDhcpPool.network || 'None'} 255.255.255.0
 default-router ${routerDhcpPool.gateway || 'None'}
!
interface GigabitEthernet0/0
 ip address 192.168.1.1 255.255.255.0
 ${routerAclApplied?.interface === 'Gi0/0' ? `ip access-group 101 ${routerAclApplied.direction}` : ''}
!
access-list 101 deny tcp host 10.10.10.50 host 192.168.1.100 eq 22
access-list 101 permit ip any any
`);
      }
    } else if (cmdLower === 'help' || cmdLower === '?') {
      output.push(`Available commands in this mode:`);
      output.push(`- help / ? : Tampilkan bantuan`);
      if (cliMode === 'user') output.push(`- enable / ena : Masuk ke privileged mode`);
      if (cliMode === 'priv') output.push(`- configure terminal / conf t : Masuk ke config mode\n- show running-config / show run : Tampilkan config`);
      if (cliMode === 'conf') {
        if (currentCliTarget === 'switch') {
          output.push(`- vlan <vlan-id> : Buat/masuk ke VLAN\n- interface <interface-id> (e.g. fa0/1) : Konfigurasi port`);
        } else {
          output.push(`- ip dhcp pool <nama> : Buat DHCP pool\n- interface <interface-id> (e.g. gi0/0) : Konfigurasi interface\n- access-list <101> deny/permit ... : Buat filter firewall`);
        }
      }
      if (cliMode === 'interface' && currentCliTarget === 'switch') output.push(`- switchport access vlan <id> : Alokasikan port ke VLAN`);
      if (cliMode === 'interface' && currentCliTarget === 'router') output.push(`- ip access-group <acl> <in/out> : Terapkan firewall ke interface`);
      if (cliMode === 'dhcp') output.push(`- network <ip> <subnet-mask> : Atur network DHCP\n- default-router <ip> : Atur Gateway DHCP`);
      output.push(`- exit : Kembali ke mode sebelumnya`);
    } else {
      output.push(`% Unknown command or incomplete parameters. Type 'help' to check.`);
    }

    setTerminalLogs(prev => [...prev, ...output]);
  };

  // ============================================================================
  // PC DESKTOP TERMINAL/IP-CONFIG ENGINES
  // ============================================================================
  const handlePcPromptSubmit = (e: React.FormEvent, pcId: 'pc1' | 'pc2' | 'pc3' | 'laptop') => {
    e.preventDefault();
    if (!pcPromptInput.trim()) return;

    const cmd = pcPromptInput.trim();
    const cmdLower = cmd.toLowerCase();
    setPcPromptInput('');

    let promptLine = `C:\\Network\\Siswa> ${cmd}`;
    let output: string[] = [promptLine];

    // State bindings
    let currentIp = pcId === 'pc1' ? pc1Ip : pcId === 'pc2' ? pc2Ip : pcId === 'pc3' ? pc3Ip : laptopIp;

    if (cmdLower === 'ipconfig') {
      output.push(`
IP Configuration:
   Ethernet Adapter local-lan:
      Connection-specific DNS Suffix : tkj.net
      IPv4 Address. . . . . . . . . . : ${currentIp.mode === 'dhcp' ? '192.168.1.10 (DHCP)' : currentIp.ip || '0.0.0.0'}
      Subnet Mask . . . . . . . . . . : ${currentIp.mask || '0.0.0.0'}
      Default Gateway . . . . . . . . : ${currentIp.gw || '0.0.0.0'}
      DNS Server. . . . . . . . . . . : ${currentIp.dns || '0.0.0.0'}
`);
    } else if (cmdLower.startsWith('ping ')) {
      const target = cmd.split(' ').pop() || '';
      output.push(`Pinging ${target} with 32 bytes of data:`);
      
      const isConnected = connections.some(c => c.from === pcId || c.to === pcId);
      const isConflict = pc2Ip.ip === pc3Ip.ip && (pcId === 'pc2' || pcId === 'pc3');

      setTimeout(() => {
        if (!isConnected) {
          setPcPromptLogs(prev => ({
            ...prev,
            [pcId]: [...prev[pcId], 'Request timed out.', 'Request timed out.', 'Request timed out.', 'Ping statistics: 3 sent, 0 received, 3 lost (100% loss).']
          }));
          return;
        }

        if (isConflict) {
          setPcPromptLogs(prev => ({
            ...prev,
            [pcId]: [...prev[pcId], 'Reply from ' + target + ': Destination Host Unreachable (ARP conflict).', 'Request timed out.', 'Reply from ' + target + ': Bytes=32 Time=350ms TTL=64', 'Ping statistics: 3 sent, 1 received, 2 lost (66% loss).']
          }));
          return;
        }

        // Target validation
        if (target === '192.168.1.1') { // Router gateway
          if (pcId === 'pc1' && !pc1Ip.ip) {
            setPcPromptLogs(prev => ({ ...prev, [pcId]: [...prev[pcId], 'Request timed out. No IP configured.'] }));
          } else {
            setPcPromptLogs(prev => ({
              ...prev,
              [pcId]: [...prev[pcId], 'Reply from 192.168.1.1: Bytes=32 Time=14ms TTL=64', 'Reply from 192.168.1.1: Bytes=32 Time=12ms TTL=64', 'Reply from 192.168.1.1: Bytes=32 Time=15ms TTL=64', 'Ping statistics: 3 sent, 3 received, 0 lost (0% loss).']
            }));
            // Trigger Mission progress
            setActiveMission(prev => {
              if (prev?.id === 1 && pcId === 'pc1' && pc1Ip.ip === '192.168.1.2') {
                const updated = prev.objectives.map(o => o.id === 'm1_ping' ? { ...o, completed: true } : o);
                return { ...prev, objectives: updated };
              }
              if (prev?.id === 2 && pcId === 'pc3' && pc3Ip.ip === '192.168.1.11') {
                const updated = prev.objectives.map(o => o.id === 'm2_ping' ? { ...o, completed: true } : o);
                return { ...prev, objectives: updated };
              }
              return prev;
            });
          }
        } else if (target === '8.8.8.8') {
          if (routerStaticRoute === '10.10.10.1') {
            setPcPromptLogs(prev => ({
              ...prev,
              [pcId]: [
                ...prev[pcId],
                'Reply from 8.8.8.8: Bytes=32 Time=35ms TTL=54',
                'Reply from 8.8.8.8: Bytes=32 Time=38ms TTL=54',
                'Reply from 8.8.8.8: Bytes=32 Time=32ms TTL=54',
                'Ping statistics: 3 sent, 3 received, 0 lost (0% loss).'
              ]
            }));

            setActiveMission(prev => {
              if (prev?.id === 6 && pcId === 'pc1') {
                const updated = prev.objectives.map(o => o.id === 'm6_ping_dns' ? { ...o, completed: true } : o);
                return { ...prev, objectives: updated };
              }
              return prev;
            });
          } else {
            setPcPromptLogs(prev => ({
              ...prev,
              [pcId]: [
                ...prev[pcId],
                'Request timed out. (No gateway route from router to host)',
                'Request timed out.',
                'Request timed out.',
                'Ping statistics: 3 sent, 0 received, 3 lost (100% loss).',
                '💡 Tip: Router Utama membutuhkan rute default ("ip route 0.0.0.0 0.0.0.0 10.10.10.1") agar PC Klien bisa terhubung ke Internet.'
              ]
            }));
          }
        } else if (target === '192.168.1.100' || target === 'tkj-server.net') {
          // Check firewall blocks for Mission 5 (Deny SSH port 22 vs permit other)
          output.push('Reply from 192.168.1.100: Bytes=32 Time=25ms TTL=63');
          output.push('Reply from 192.168.1.100: Bytes=32 Time=24ms TTL=63');
          output.push('Ping statistics: 2 sent, 2 received, 0 lost (0% loss).');
        } else {
          output.push('Reply from ' + target + ': Bytes=32 Time=45ms TTL=54');
          output.push('Reply from ' + target + ': Bytes=32 Time=42ms TTL=54');
        }
      }, 500);

    } else if (cmdLower === 'help') {
      output.push(`Daftar perintah yang didukung:`);
      output.push(`- ipconfig : Tampilkan detail alamat IP perangkat`);
      output.push(`- ping <ip-target> : Kirim ICMP echo request ke target`);
      output.push(`- help : Tampilkan menu bantuan ini`);
    } else {
      output.push(` Perintah tidak dikenal. Ketik "help".`);
    }

    setPcPromptLogs(prev => ({
      ...prev,
      [pcId]: [...prev[pcId], ...output]
    }));
  };

  // ============================================================================
  // AI INSTRUCTOR JAR (GEMINI SERVER INTEGRATION)
  // ============================================================================
  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setAiInput('');
    setAiChat(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const response = await fetch('/api/instructor-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          currentMission: activeMission,
          chatHistory: aiChat.slice(-6) // Send last 6 messages to keep context
        })
      });
      const data = await response.json();
      setAiChat(prev => [...prev, { sender: 'assistant', text: data.reply || 'Maaf, saya sedang mengalami kendala jaringan bimbingan.' }]);
    } catch (err) {
      // Local fallback in case server/API key is down
      let fallbackText = 'Maaf, server instruktur sedang offline.';
      if (activeMission?.id === 1) {
        fallbackText = 'Untuk Misi 1, Anda perlu menyambungkan kabel UTP dulu dari PC-1 ke Switch Port Fa0/1, lalu atur IP PC-1 secara statis ke 192.168.1.2 di tab Config IP, dan lakukan ping ke Gateway 192.168.1.1.';
      } else if (activeMission?.id === 3) {
        fallbackText = 'Untuk Misi 3, sambungkan kabel Console hitam dari Laptop ke Port Console Switch. Masuk ke terminal laptop, lalu ketik "enable", "configure terminal". Gunakan perintah "vlan 10", "name HR" lalu assign interface range fa0/1 - 2 ke VLAN tersebut.';
      }
      setAiChat(prev => [...prev, { sender: 'assistant', text: `[OFFLINE MODE] ${fallbackText}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div id="gamejar_root" className="w-full h-full text-[#d1d5db] font-sans flex flex-col overflow-hidden select-none bg-[#0c0d0f]">
      
      {/* HEADER SECTION */}
      <header className="h-14 border-b border-white/10 bg-[#15171b] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#22c55e] rounded flex items-center justify-center text-black font-extrabold text-sm shadow-md shadow-green-500/20">GJ</div>
          <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center">
            GAME<span className="text-[#22c55e]">Jar</span>
            <span className="text-[10px] font-mono font-normal opacity-50 uppercase tracking-widest ml-3 border-l border-white/10 pl-3">SMK TKJ Lab v1.1.2</span>
          </h1>
        </div>
        
        {/* Navigation & Score HUD */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <button 
              onClick={() => { playSound('click'); setCurrentScreen('lobby'); }}
              className={`text-xs px-3 py-1 rounded transition-colors ${currentScreen === 'lobby' ? 'bg-[#22c55e] text-black font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Lobby
            </button>
            <button 
              onClick={() => { playSound('click'); if (unlockedMissions.length > 0 && !activeMission) setActiveMission(MISSIONS_DATA[0]); setCurrentScreen('game'); }}
              className={`text-xs px-3 py-1 rounded transition-colors ${currentScreen === 'game' ? 'bg-[#22c55e] text-black font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Lab Simulasi
            </button>
            <button 
              onClick={() => { playSound('click'); setCurrentScreen('handbook'); }}
              className={`text-xs px-3 py-1 rounded transition-colors ${currentScreen === 'handbook' ? 'bg-[#22c55e] text-black font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Buku Panduan
            </button>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest opacity-50">Total XP</span>
            <span className="mono text-[#22c55e] font-bold text-xs">{xp.toLocaleString()} / {(level * 1000).toLocaleString()} XP</span>
          </div>
          
          <div className="h-8 w-px bg-white/10"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-white">Siswa_TKJ_Spesialis</p>
              <p className="text-[9px] text-[#22c55e] mono">Level {level} Network Administrator</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center font-bold text-white text-xs">
              TKJ
            </div>
          </div>
        </div>
      </header>

      {/* SCREEN ROUTER */}
      {currentScreen === 'lobby' && (
        <div className="flex-1 overflow-y-auto grid-bg p-8 flex flex-col items-center">
          <div className="max-w-4xl w-full text-center mb-8 flex flex-col items-center">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Pilih Misi Praktikum Jaringan</h2>
            <p className="text-slate-400 text-sm mb-4">Selesaikan simulasi laboratorium TKJ untuk naik level, kumpulkan XP, dan jadilah Ahli Infrastruktur Jaringan SMK!</p>

          </div>

          {/* Lobby Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {MISSIONS_DATA.map((mission) => {
              const isUnlocked = unlockedMissions.includes(mission.id);
              const isCompleted = completedMissions.includes(mission.id);

              return (
                <div 
                  key={mission.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isUnlocked 
                      ? 'bg-[#15171b] border-white/10 hover:border-[#22c55e]/50 cursor-pointer hover:shadow-xl hover:shadow-[#22c55e]/5' 
                      : 'bg-black/30 border-white/5 opacity-50 pointer-events-none'
                  }`}
                  onClick={() => {
                    if (isUnlocked) {
                      playSound('click');
                      setActiveMission(mission);
                      setCurrentScreen('game');
                      initializeMissionState(mission.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] mono bg-[#22c55e]/10 text-[#22c55e] px-2 py-0.5 rounded font-bold">{mission.code}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        mission.difficulty === 'Mudah' ? 'bg-green-500/10 text-green-400' :
                        mission.difficulty === 'Sedang' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{mission.difficulty}</span>
                      {isCompleted && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> SELESAI
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{mission.title}</h3>
                  <p className="text-[11px] text-slate-500 mb-4 font-mono uppercase tracking-widest">{mission.subtitle}</p>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{mission.description}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
                    <div className="text-left">
                      <p className="text-[9px] opacity-40 uppercase">XP REWARD</p>
                      <p className="text-xs text-yellow-500 font-bold">+{mission.xpReward} XP</p>
                    </div>
                    {isUnlocked ? (
                      <button className="flex items-center gap-1 text-xs bg-[#22c55e] text-black font-extrabold px-3 py-1.5 rounded hover:bg-green-400 transition-colors">
                        MULAI <Play className="w-3 h-3 fill-current" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentScreen === 'game' && (
        <main className="flex-1 flex overflow-hidden">
          
          {/* LEFT SIDEBAR: MISSION CARD & OBJECTIVES */}
          <aside className="w-72 border-r border-white/10 bg-[#0f1115] flex flex-col shrink-0">
            {activeMission ? (
              <div className="flex-1 flex flex-col overflow-y-auto">
                
                {/* Active Mission Overview */}
                <div className="p-4 border-b border-white/5">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Misi Aktif</h2>
                  <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[11px] text-yellow-500 font-bold mono">{activeMission.code}</p>
                      <span className="text-[9px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded">{activeMission.difficulty}</span>
                    </div>
                    <p className="text-sm font-extrabold text-white">{activeMission.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{activeMission.description}</p>
                  </div>
                </div>

                {/* Objectives Checklist */}
                <div className="p-4 flex-1">
                  <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Tujuan Praktikum</h2>
                  <div className="space-y-2.5">
                    {activeMission.objectives.map((obj) => (
                      <div 
                        key={obj.id} 
                        className={`p-3 rounded-lg border transition-all flex gap-3 items-start ${
                          obj.completed 
                            ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                            : 'bg-white/5 border-white/5 text-slate-300'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={obj.completed} 
                          readOnly 
                          className="mt-0.5 rounded border-slate-700 bg-slate-900 text-[#22c55e] focus:ring-0 pointer-events-none" 
                        />
                        <span className="text-xs leading-relaxed">{obj.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Crimping Shortcut Button for Mission 1 */}
                  {activeMission.id === 1 && (
                    <div className="mt-4 p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">Pekerjaan Tambahan</span>
                        <span className="text-[8px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded font-mono">CCNA / TKJ</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                        Crimping kabel UTP Straight-Through dengan susunan pin standar <strong>T568B</strong>.
                      </p>
                      <button
                        onClick={() => { playSound('click'); setIsCrimpingOpen(true); }}
                        className={`w-full py-2 px-3 text-xs font-bold font-mono rounded-lg transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                          isCrimpingSuccess 
                            ? 'bg-green-500/10 border-green-500/25 text-green-400 hover:bg-green-500/20' 
                            : 'bg-yellow-500/10 border-yellow-500/25 text-yellow-500 hover:bg-yellow-500/20 animate-pulse'
                        }`}
                      >
                        🔧 {isCrimpingSuccess ? 'Ubah Crimping (Sudah Sukses)' : 'Mulai Crimping UTP Straight'}
                      </button>
                    </div>
                  )}

                  {activeMission.objectives.every(o => o.completed) && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <button
                        onClick={() => {
                          playSound('success');
                          const nextXp = xp + activeMission.xpReward;
                          setXp(nextXp);

                          const nextCompleted = [...completedMissions];
                          if (!nextCompleted.includes(activeMission.id)) {
                            nextCompleted.push(activeMission.id);
                          }
                          setCompletedMissions(nextCompleted);

                          const nextUnlocked = [...unlockedMissions];
                          const nextId = activeMission.id + 1;
                          if (nextId <= MISSIONS_DATA.length && !nextUnlocked.includes(nextId)) {
                            nextUnlocked.push(nextId);
                          }
                          setUnlockedMissions(nextUnlocked);
                          saveProgress(nextXp, nextCompleted, nextUnlocked);

                          setTerminalLogs(prev => [
                            ...prev,
                            `\n🏆 [MISI SELESAI] Selamat! Anda berhasil menyelesaikan ${activeMission.title}!`,
                            `✨ Hadiah XP: +${activeMission.xpReward} XP. Total XP Anda sekarang: ${nextXp} XP.`
                          ]);

                          // Open success modal
                          setSuccessModalData({
                            id: activeMission.id,
                            title: activeMission.title,
                            xpReward: activeMission.xpReward
                          });
                          setShowSuccessModal(true);
                        }}
                        className="w-full py-3 bg-[#22c55e] hover:bg-[#1ebd53] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 animate-pulse cursor-pointer border border-[#22c55e]"
                      >
                        🏆 Klaim & Selesaikan Misi!
                      </button>
                    </div>
                  )}
                </div>

                {/* INVENTORY PANEL */}
                <div className="p-4 bg-green-500/5 border-t border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-extrabold text-[#22c55e] uppercase tracking-widest">Inventory Alat</span>
                    <span className="text-[9px] text-slate-500 mono">Kabel Hubung</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      onClick={() => { playSound('click'); setSelectedTool(selectedTool === 'utp' ? null : 'utp'); setWireStartNode(null); }}
                      className={`aspect-square rounded border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedTool === 'utp' ? 'bg-[#22c55e]/20 border-[#22c55e]' : 'bg-[#15171b] border-white/10 hover:border-white/30'
                      }`}
                      title="Kabel LAN UTP"
                    >
                      <Cable className={`w-5 h-5 ${selectedTool === 'utp' ? 'text-[#22c55e]' : 'text-slate-400'}`} />
                      <span className="text-[8px] mono">UTP</span>
                    </button>
                    
                    <button 
                      onClick={() => { playSound('click'); setSelectedTool(selectedTool === 'console' ? null : 'console'); setWireStartNode(null); }}
                      className={`aspect-square rounded border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedTool === 'console' ? 'bg-blue-500/20 border-blue-500' : 'bg-[#15171b] border-white/10 hover:border-white/30'
                      }`}
                      title="Kabel Console Serial"
                    >
                      <Cpu className={`w-5 h-5 ${selectedTool === 'console' ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-[8px] mono">Console</span>
                    </button>

                    <div className="aspect-square bg-slate-800/30 rounded border border-white/5 flex flex-col items-center justify-center opacity-30 cursor-not-allowed">
                      <Wifi className="w-5 h-5 text-slate-600" />
                      <span className="text-[8px] mono text-slate-600">SFP</span>
                    </div>

                    {activeMission?.id === 1 ? (
                      <button 
                        onClick={() => { playSound('click'); setIsCrimpingOpen(true); }}
                        className={`aspect-square rounded border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isCrimpingSuccess ? 'bg-green-500/10 border-green-500/35 text-green-400' : 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400 animate-pulse'
                        }`}
                        title="Alat Crimping UTP"
                      >
                        <Network className={`w-5 h-5 ${isCrimpingSuccess ? 'text-green-400' : 'text-yellow-400'}`} />
                        <span className="text-[7.5px] mono font-bold uppercase">Crimp</span>
                      </button>
                    ) : (
                      <div className="aspect-square bg-slate-800/30 rounded border border-white/5 flex flex-col items-center justify-center opacity-30 cursor-not-allowed">
                        <Database className="w-5 h-5 text-slate-600" />
                        <span className="text-[8px] mono text-slate-600">Fiber</span>
                      </div>
                    )}
                  </div>
                  {selectedTool && (
                    <p className="text-[10px] text-yellow-500 mt-2 animate-pulse font-mono">
                      ⚡ Klik PORT pada perangkat untuk menyambung...
                    </p>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-4 text-center text-slate-500 my-auto">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Silakan pilih misi di Lobby terlebih dahulu.</p>
              </div>
            )}
          </aside>

          {/* CENTER PANEL: NETWORK MAP SIMULATOR */}
          <div className="flex-1 grid-bg flex flex-col overflow-hidden relative">
            
            {/* CANVAS WORKSPACE BAR */}
            <div className="h-10 border-b border-white/10 bg-[#15171b]/80 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#22c55e]" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">Topologi Jaringan Lab Aktif</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (activeMission) {
                      playSound('fail');
                      initializeMissionState(activeMission.id);
                      setTerminalLogs(prev => [...prev, '🔄 [SYSTEM] Jaringan dikembalikan ke konfigurasi awal untuk Misi ini!']);
                    }
                  }}
                  className="flex items-center gap-1.5 text-[10px] bg-red-950/40 hover:bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-500/20 transition-all font-mono"
                >
                  <RefreshCw className="w-3 h-3" /> RESET LAB
                </button>
              </div>
            </div>

            {/* INTERACTIVE NETWORK MAP AREA */}
            <div className="flex-1 p-6 relative flex flex-col overflow-auto">
              
              {/* Device Topology Graph */}
              <div className="grid grid-cols-4 gap-x-12 gap-y-8 w-full max-w-4xl m-auto relative z-10">
                
                {/* LINE 1: ROUTER & INTERNET */}
                <div className="col-span-1"></div>
                
                {/* Router Card */}
                <div 
                  onClick={() => { playSound('click'); setOpenedRouterId(true); setRouterTab('dhcp'); }}
                  className={`col-span-2 p-3 bg-[#15171b] border rounded-xl flex flex-col relative cursor-pointer transition-all ${
                    openedRouterId || currentCliTarget === 'router' ? 'border-[#22c55e] ring-2 ring-[#22c55e]/10 bg-[#191c22]' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#22c55e]" />
                      <span className="text-xs font-bold text-white">Router Utama</span>
                    </div>
                    <span className="text-[8px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-slate-400">Gi0/0 - Gi0/1</span>
                  </div>
                  
                  {/* Ports list */}
                  <div className="flex gap-2 mb-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePortClick('router', 'Gi0/0'); }}
                      className={`text-[9px] font-mono px-2 py-1 rounded flex items-center gap-1 border transition-all ${
                        connections.some(c => (c.from === 'router' && c.fromPort === 'Gi0/0') || (c.to === 'router' && c.toPort === 'Gi0/0'))
                          ? 'bg-green-950/40 border-green-500/40 text-green-400'
                          : 'bg-black border-white/10 text-slate-500 hover:text-white'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${connections.some(c => (c.from === 'router' && c.fromPort === 'Gi0/0') || (c.to === 'router' && c.toPort === 'Gi0/0')) ? 'bg-green-500 server-led' : 'bg-red-500'}`} />
                      Gi0/0
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePortClick('router', 'Console'); }}
                      className={`text-[9px] font-mono px-2 py-1 rounded flex items-center gap-1 border transition-all ${
                        connections.some(c => (c.from === 'router' && c.fromPort === 'Console') || (c.to === 'router' && c.toPort === 'Console'))
                          ? 'bg-blue-950/40 border-blue-500/40 text-blue-400'
                          : 'bg-black border-white/10 text-slate-500 hover:text-white'
                      }`}
                    >
                      Console
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[7px] text-[#22c55e] uppercase tracking-wider font-mono font-bold animate-pulse">⚙️ KLIK UNTUK CONFIG</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); playSound('click'); setOpenedRouterId(true); setRouterTab('cli'); }}
                      className="text-[9px] bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 px-2 py-0.5 rounded hover:bg-[#22c55e] hover:text-black font-mono"
                    >
                      CLI CONSOLE
                    </button>
                  </div>
                </div>

                <div className="col-span-1 bg-[#101216] border border-white/5 p-3 rounded-xl flex flex-col justify-center text-center">
                  <Wifi className="w-6 h-6 text-blue-400 mx-auto mb-1 animate-pulse" />
                  <span className="text-[10px] font-bold text-white">INTERNET CLOUD</span>
                  <span className="text-[8px] text-slate-500 font-mono">GW: 10.10.10.1</span>
                </div>

                {/* LINE 2: SWITCH */}
                <div 
                  onClick={() => { playSound('click'); setOpenedSwitchId(true); setSwitchTab('vlan'); }}
                  className={`col-span-4 p-4 bg-[#15171b] border rounded-xl flex flex-col cursor-pointer transition-all ${
                    openedSwitchId || currentCliTarget === 'switch' ? 'border-[#22c55e] ring-2 ring-[#22c55e]/10 bg-[#191c22]' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-white">Switch Utama L2 (Cisco Catalyst 2960)</span>
                    </div>
                    <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded font-mono">STATUS: UP</span>
                  </div>

                  {/* Patch Panel Ports Fa0/1 to Fa0/8 */}
                  <div className="grid grid-cols-8 gap-2.5 mb-3">
                    {['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5', 'Fa0/6', 'Fa0/7', 'Fa0/8'].map((port) => {
                      const isConnected = connections.some(c => (c.from === 'switch' && c.fromPort === port) || (c.to === 'switch' && c.toPort === port));
                      const vlan = switchVlans[port] || 1;
                      
                      return (
                        <button 
                          key={port}
                          onClick={(e) => { e.stopPropagation(); handlePortClick('switch', port); }}
                          className={`p-2 border rounded bg-black flex flex-col items-center transition-all ${
                            isConnected ? 'border-green-500/40 text-green-400' : 'border-white/10 text-slate-500 hover:text-white'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mb-1 ${isConnected ? 'bg-green-500 server-led' : 'bg-slate-700'}`} />
                          <span className="text-[8px] font-mono leading-none">{port}</span>
                          <span className="text-[7px] font-mono mt-1 px-1 bg-white/5 rounded text-yellow-500 leading-none">V{vlan}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePortClick('switch', 'Console'); }}
                      className={`text-[9px] font-mono px-2 py-1 rounded border ${
                        connections.some(c => (c.from === 'switch' && c.fromPort === 'Console') || (c.to === 'switch' && c.toPort === 'Console'))
                          ? 'bg-blue-950/40 border-blue-500/40 text-blue-400'
                          : 'bg-black border-white/10 text-slate-500 hover:text-white'
                      }`}
                    >
                      Console Port
                    </button>
                    
                    <span className="text-[7px] text-[#22c55e] uppercase tracking-wider font-mono font-bold animate-pulse">⚙️ KLIK UNTUK KELOLA VLAN / PORT</span>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); playSound('click'); setOpenedSwitchId(true); setSwitchTab('cli'); }}
                      className="text-[9px] bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 px-2.5 py-1 rounded hover:bg-[#22c55e] hover:text-black font-mono font-bold"
                    >
                      CLI SWITCH
                    </button>
                  </div>
                </div>

                {/* LINE 3: PC CLIENTS */}
                {/* PC-1 */}
                <div 
                  className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                    openedPcId === 'pc1' ? 'border-[#22c55e] bg-[#15171b]' : 'bg-[#15171b]/60 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => { playSound('click'); setOpenedPcId('pc1'); setPcTab('config'); }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <Monitor className="w-5 h-5 text-slate-400" />
                    <span className="text-[7px] font-mono bg-[#22c55e]/10 text-[#22c55e] px-1 rounded">Dept HR</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">PC Client-1</h4>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{pc1Ip.mode === 'dhcp' ? 'DHCP' : pc1Ip.ip || 'No IP Address'}</p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[8px] text-slate-400 mono">LAN Port</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePortClick('pc1', 'Eth0'); }}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${connections.some(c => c.from === 'pc1' || c.to === 'pc1') ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-black border-white/20'}`}
                    >
                      •
                    </button>
                  </div>
                </div>

                {/* PC-2 */}
                <div 
                  className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                    openedPcId === 'pc2' ? 'border-[#22c55e] bg-[#15171b]' : 'bg-[#15171b]/60 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => { playSound('click'); setOpenedPcId('pc2'); setPcTab('config'); }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <Monitor className="w-5 h-5 text-slate-400" />
                    <span className="text-[7px] font-mono bg-[#22c55e]/10 text-[#22c55e] px-1 rounded">Dept HR</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">PC Client-2</h4>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{pc2Ip.mode === 'dhcp' ? 'DHCP' : pc2Ip.ip || 'No IP Address'}</p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[8px] text-slate-400 mono">LAN Port</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePortClick('pc2', 'Eth0'); }}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${connections.some(c => c.from === 'pc2' || c.to === 'pc2') ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-black border-white/20'}`}
                    >
                      •
                    </button>
                  </div>
                </div>

                {/* PC-3 */}
                <div 
                  className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                    openedPcId === 'pc3' ? 'border-[#22c55e] bg-[#15171b]' : 'bg-[#15171b]/60 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => { playSound('click'); setOpenedPcId('pc3'); setPcTab('config'); }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <Monitor className="w-5 h-5 text-slate-400" />
                    <span className="text-[7px] font-mono bg-yellow-500/10 text-yellow-400 px-1 rounded">Dept Finance</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">PC Client-3</h4>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">{pc3Ip.ip}</p>
                  
                  {pc2Ip.ip === pc3Ip.ip && (
                    <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold animate-pulse text-center mt-1">IP CONFLICT</span>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[8px] text-slate-400 mono">LAN Port</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePortClick('pc3', 'Eth0'); }}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${connections.some(c => c.from === 'pc3' || c.to === 'pc3') ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-black border-white/20'}`}
                    >
                      •
                    </button>
                  </div>
                </div>

                {/* Laptop Admin */}
                <div 
                  className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                    openedPcId === 'laptop' ? 'border-blue-500 bg-[#15171b]' : 'bg-[#15171b]/60 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => { playSound('click'); setOpenedPcId('laptop'); setPcTab('config'); }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <span className="text-[7px] font-mono bg-blue-500/10 text-blue-400 px-1 rounded">Laptop Admin</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Laptop Admin</h4>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">RS232 Serial Port</p>
                  
                  <div className="mt-3 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-slate-400 mono">RS232</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePortClick('laptop', 'RS232'); }}
                        className={`w-4 h-4 rounded border flex items-center justify-center ${connections.some(c => c.from === 'laptop' && c.fromPort === 'RS232' || c.to === 'laptop' && c.toPort === 'RS232') ? 'bg-blue-500/20 border-blue-500 text-blue-500' : 'bg-black border-white/20'}`}
                      >
                        •
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* OVERLAY OBJECTIVE CHECKLIST BANNER (DRAGGABLE WIDGET) */}
              <div 
                style={{ 
                  top: `${connectionsWidgetPos.y}px`, 
                  right: `${connectionsWidgetPos.x}px` 
                }}
                className={`absolute w-56 bg-[#1a1c22]/95 border ${isDraggingConnections ? 'border-[#22c55e]' : 'border-white/10'} p-3 rounded-lg shadow-2xl backdrop-blur-md z-30 select-none transition-shadow duration-150 ${isDraggingConnections ? 'shadow-green-500/10 shadow-lg' : ''}`}
              >
                {/* Drag Handle */}
                <div 
                  onMouseDown={handleDragStart}
                  className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-white transition-colors"
                  title="Klik dan tahan untuk menggeser widget ini"
                >
                  <div className="flex items-center gap-1.5">
                    {/* Grip Icon */}
                    <div className="grid grid-cols-2 gap-0.5 opacity-50 shrink-0">
                      <span className="w-1 h-1 bg-current rounded-full" />
                      <span className="w-1 h-1 bg-current rounded-full" />
                      <span className="w-1 h-1 bg-current rounded-full" />
                      <span className="w-1 h-1 bg-current rounded-full" />
                    </div>
                    <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold select-none">Koneksi Kabel</span>
                  </div>
                  <span className="text-[8px] font-mono bg-white/5 text-slate-500 px-1 rounded">WIDGET</span>
                </div>

                {connections.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-1 text-center">Belum ada kabel terhubung.</p>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {connections.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center gap-1.5 text-[9px] bg-white/5 p-1 rounded">
                        <span className="truncate max-w-[130px] text-slate-400 font-mono" title={`${c.from.toUpperCase()}(${c.fromPort}) ➔ ${c.to.toUpperCase()}(${c.toPort})`}>
                          {c.from.toUpperCase()}({c.fromPort})➔{c.to.toUpperCase()}({c.toPort})
                        </span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeConnection(idx); }}
                          className="text-red-400 hover:text-red-300 px-1 hover:bg-white/5 rounded transition-all"
                          title="Cabut kabel"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* LOWER TERMINAL: INTERACTIVE SW/ROUTER CLI CONSOLE */}
            <div className={`border-t border-white/10 bg-[#0a0b0e] flex flex-col shrink-0 transition-all duration-300 ${
              isTerminalCollapsed ? 'h-9' : 'h-52'
            }`}>
              
              {/* Terminal Connection Bar */}
              <div 
                className="px-4 py-1.5 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0 select-none cursor-pointer" 
                onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 ${currentCliTarget ? 'bg-[#22c55e] server-led' : 'bg-slate-600'} rounded-full`} />
                  <span className="mono text-[10px] text-slate-400 uppercase tracking-wide">
                    {currentCliTarget 
                      ? `Koneksi CLI Aktif: ${currentCliTarget.toUpperCase()}# (Tipe: Cisco IOS)` 
                      : 'Terminal CLI Console'}
                  </span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {currentCliTarget && (
                    <button 
                      onClick={() => { playSound('click'); setCurrentCliTarget(null); }}
                      className="text-[9px] bg-red-950/40 hover:bg-red-900/40 text-red-400 px-2 py-0.5 rounded border border-red-500/20 mr-1"
                    >
                      Tutup CLI
                    </button>
                  )}
                  <button
                    onClick={() => { playSound('click'); setIsTerminalCollapsed(!isTerminalCollapsed); }}
                    className="text-[9px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-2 py-0.5 rounded border border-white/5 flex items-center gap-1 font-mono"
                  >
                    {isTerminalCollapsed ? '▲ BUKA TERMINAL' : '▼ SEMBUNYIKAN'}
                  </button>
                </div>
              </div>

              {/* Terminal Output Logs */}
              {!isTerminalCollapsed && (
                <div className="flex-1 p-4 mono text-xs text-green-400 overflow-y-auto leading-relaxed font-mono">
                  {terminalLogs.length === 0 ? (
                    <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-2">
                      <TerminalIcon className="w-8 h-8 opacity-40 animate-pulse" />
                      <p className="text-[11px] text-center">Silakan klik tombol "CLI SWITCH" atau "CLI ROUTER" pada peranti jaringan di atas untuk mengaktifkan terminal konfigurasi.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {terminalLogs.map((log, idx) => (
                        <pre key={idx} className="whitespace-pre-wrap font-mono break-all">{log}</pre>
                      ))}
                      <div ref={terminalBottomRef} />
                    </div>
                  )}
                </div>
              )}

              {/* Terminal Input Box */}
              {!isTerminalCollapsed && currentCliTarget && (
                <form onSubmit={handleCliSubmit} className="border-t border-white/10 bg-black flex items-center shrink-0">
                  <span className="text-green-500 mono font-bold pl-4 pr-1 text-xs">{currentCliTarget === 'switch' ? 'Switch' : 'Router'}#</span>
                  <input 
                    type="text"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    placeholder="Ketik perintah Cisco IOS di sini... (Contoh: 'enable', 'conf t', 'help')"
                    className="flex-1 bg-transparent px-2 py-2 text-white mono text-xs font-mono"
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className="bg-[#22c55e] hover:bg-green-400 text-black px-4 py-2 text-xs font-extrabold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    ENTER <ArrowRight className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* RIGHT SIDEBAR: REALTIME MONITOR & AI INSTRUCTOR HELP */}
          <aside className="w-80 border-l border-white/10 bg-[#0f1115] p-4 flex flex-col gap-5 shrink-0 overflow-y-auto">
            
            {/* NETWORK TELEMETRY */}
            <section className="bg-white/5 p-3 rounded-lg border border-white/5">
              <h3 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-[#22c55e]" /> LIVE TRAFFIC MONITOR
              </h3>
              
              {/* Telemetry Chart Simulation SVG */}
              <div className="h-14 w-full bg-black/40 rounded border border-white/5 relative overflow-hidden mb-3">
                <svg viewBox="0 0 100 40" className="w-full h-full text-[#22c55e] opacity-35 animate-pulse">
                  <path d="M0 35 Q15 15, 30 25 T60 5 T90 30 L100 20 L100 40 L0 40 Z" fill="currentColor" />
                </svg>
                <div className="absolute inset-0 p-2 flex justify-between items-end">
                  <p className="mono text-xs font-extrabold text-white">{metrics.traffic} KB/s</p>
                  <p className="mono text-[8px] text-slate-500 uppercase font-bold">Total throughput</p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[9px] uppercase font-bold mb-1 font-mono">
                    <span className="text-slate-400">Latency</span>
                    <span className={`${metrics.latency > 100 ? 'text-red-400' : 'text-green-500'}`}>{metrics.latency}ms</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${metrics.latency > 100 ? 'bg-red-500' : 'bg-[#22c55e]'}`} 
                      style={{ width: `${Math.min(100, metrics.latency / 4)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] uppercase font-bold mb-1 font-mono">
                    <span className="text-slate-400">Packet Loss</span>
                    <span className={`${metrics.loss > 2 ? 'text-red-400 animate-pulse' : 'text-green-500'}`}>{metrics.loss}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${metrics.loss > 2 ? 'bg-red-500' : 'bg-[#22c55e]'}`} 
                      style={{ width: `${Math.min(100, metrics.loss * 10)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* AI TUTOR: TANYA INSTRUKTUR JAR */}
            <section className="flex-1 flex flex-col bg-white/5 rounded-lg border border-white/5 p-3 overflow-hidden min-h-[250px]">
              <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full server-led" />
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Tanya Instruktur Jar</h4>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-2 max-h-[280px]">
                {aiChat.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-[#22c55e]/10 border border-[#22c55e]/15 text-white ml-6 text-right' 
                        : 'bg-black/30 border border-white/5 text-slate-300 mr-6'
                    }`}
                  >
                    <p className="font-bold text-[8px] uppercase tracking-widest text-slate-400 mb-0.5">
                      {msg.sender === 'user' ? 'Anda (Siswa)' : 'Instruktur Jar'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
                {aiLoading && (
                  <div className="text-slate-500 italic text-[11px] animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Instruktur sedang mengetik...
                  </div>
                )}
              </div>

              {/* Chat Form */}
              <form onSubmit={handleAiChatSubmit} className="mt-auto flex border border-white/10 rounded overflow-hidden">
                <input 
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Tanyakan materi TKJ di sini..."
                  className="flex-1 bg-black/40 px-2 py-1.5 text-xs text-white"
                  disabled={aiLoading}
                />
                <button 
                  type="submit" 
                  className="bg-[#22c55e] text-black px-3 py-1.5 hover:bg-green-400 shrink-0 flex items-center justify-center transition-colors"
                  disabled={aiLoading}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </section>

            {/* INSTRUCTOR TIP TIP OF THE MISSION */}
            {activeMission && (
              <section className="p-3 border border-yellow-500/20 bg-yellow-500/5 rounded-lg mt-auto shrink-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-1.5 h-3 bg-yellow-500 rounded-full" />
                  <h4 className="text-[10px] font-extrabold text-yellow-500 uppercase font-mono">Bantuan Teknis</h4>
                </div>
                <p className="text-[10px] leading-relaxed italic text-slate-300 font-mono whitespace-pre-wrap">
                  {activeMission.technicalGuide}
                </p>
              </section>
            )}

          </aside>

        </main>
      )}

      {currentScreen === 'handbook' && (
        <div className="flex-1 overflow-y-auto grid-bg p-8 flex flex-col items-center">
          <div className="max-w-3xl w-full">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-[#22c55e]" /> Buku Panduan Teknik Komputer Jaringan (TKJ)
            </h2>
            <p className="text-slate-400 text-xs mb-8 font-mono uppercase tracking-widest">Modul Teori dan Praktis Lab Simulator GAMEJar</p>

            {/* Theory Sections */}
            <div className="space-y-6">
              
              <div className="p-5 bg-[#15171b] border border-white/10 rounded-xl">
                <h3 className="text-md font-bold text-[#22c55e] mb-2 font-mono flex items-center gap-2">
                  <span>1.</span> Pengkabelan (Cabling) UTP
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kabel <strong>UTP (Unshielded Twisted Pair)</strong> dengan konektor RJ-45 digunakan untuk menyambungkan perangkat lokal. 
                  Ada dua standar susunan kabel: <strong>Straight-through</strong> (untuk perangkat berbeda, seperti PC ke Switch) 
                  dan <strong>Crossover</strong> (untuk perangkat sejenis, seperti PC ke PC atau Switch ke Switch).
                </p>
              </div>

              <div className="p-5 bg-[#15171b] border border-white/10 rounded-xl">
                <h3 className="text-md font-bold text-[#22c55e] mb-2 font-mono flex items-center gap-2">
                  <span>2.</span> Pengalamatan IP (IP Addressing)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  IP Address adalah alamat logis perangkat di jaringan. Agar dua perangkat dapat saling berkomunikasi secara langsung, 
                  keduanya harus berada di dalam subnet yang sama. Subnet ditentukan oleh <strong>Subnet Mask</strong>.
                </p>
                <div className="bg-black p-3.5 rounded border border-white/5 mono text-[11px] font-mono leading-relaxed">
                  Contoh Subnet 192.168.1.0/24:<br />
                  - IP Gateway Router: 192.168.1.1 (Pintu keluar LAN)<br />
                  - IP PC Client-1: 192.168.1.2 (Subnet Mask: 255.255.255.0)<br />
                  - IP PC Client-2: 192.168.1.3 (Subnet Mask: 255.255.255.0)
                </div>
              </div>

              <div className="p-5 bg-[#15171b] border border-white/10 rounded-xl">
                <h3 className="text-md font-bold text-[#22c55e] mb-2 font-mono flex items-center gap-2">
                  <span>3.</span> Virtual LAN (VLAN)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>VLAN</strong> digunakan untuk membagi satu broadcast domain fisik menjadi beberapa broadcast domain logis 
                  di dalam Switch Layer 2. Hal ini bertujuan meningkatkan performa jaringan, menyederhanakan administrasi, 
                  dan memperketat keamanan lalu lintas data antardepartemen.
                </p>
              </div>

              <div className="p-5 bg-[#15171b] border border-white/10 rounded-xl">
                <h3 className="text-md font-bold text-[#22c55e] mb-2 font-mono flex items-center gap-2">
                  <span>4.</span> DHCP (Dynamic Host Configuration Protocol)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Layanan <strong>DHCP Server</strong> mengalokasikan alamat IP secara otomatis ke perangkat client yang baru terhubung. 
                  Komponen utama DHCP meliputi DHCP Pool, IP Range, Default Gateway (Router), dan DNS Server. 
                  Siswa tidak perlu repot mengetik IP statis di setiap host.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DETAILED DIALOG: PC NETWORK SETTINGS OVERLAY */}
      {openedPcId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-[580px] h-[480px] bg-[#15171b] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Title bar */}
            <div className="bg-slate-900/90 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <Monitor className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono">{openedPcId.toUpperCase()} Desktop Interface</span>
              </div>
              <button 
                onClick={() => { playSound('click'); setOpenedPcId(null); }}
                className="text-slate-400 hover:text-white text-xs font-mono bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Inside PC App Toolbar tabs */}
            <div className="bg-white/5 border-b border-white/5 px-4 flex gap-1 pt-1.5 shrink-0">
              <button 
                onClick={() => { playSound('click'); setPcTab('config'); }}
                className={`text-xs px-3 py-1.5 rounded-t-lg font-mono flex items-center gap-1.5 transition-all ${
                  pcTab === 'config' ? 'bg-[#15171b] border-t border-x border-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" /> Konfigurasi IP
              </button>
              <button 
                onClick={() => { playSound('click'); setPcTab('desktop'); }}
                className={`text-xs px-3 py-1.5 rounded-t-lg font-mono flex items-center gap-1.5 transition-all ${
                  pcTab === 'desktop' ? 'bg-[#15171b] border-t border-x border-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" /> Command Prompt
              </button>
              <button 
                onClick={() => { playSound('click'); setPcTab('web'); }}
                className={`text-xs px-3 py-1.5 rounded-t-lg font-mono flex items-center gap-1.5 transition-all ${
                  pcTab === 'web' ? 'bg-[#15171b] border-t border-x border-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Web Browser
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 p-5 overflow-y-auto">
              {pcTab === 'config' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/5 mb-4">
                    <p className="text-xs text-slate-300">Konfigurasi Pengalamatan IP Perangkat</p>
                    <div className="flex bg-black p-1 rounded border border-white/10 gap-1 font-mono">
                      <button 
                        onClick={() => {
                          playSound('click');
                          if (openedPcId === 'pc1') setPc1Ip(prev => ({ ...prev, mode: 'static' }));
                          else if (openedPcId === 'pc2') setPc2Ip(prev => ({ ...prev, mode: 'static' }));
                          else if (openedPcId === 'pc3') setPc3Ip(prev => ({ ...prev, mode: 'static' }));
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded ${
                          (openedPcId === 'pc1' && pc1Ip.mode === 'static') ||
                          (openedPcId === 'pc2' && pc2Ip.mode === 'static') ||
                          (openedPcId === 'pc3' && pc3Ip.mode === 'static') ||
                          openedPcId === 'laptop'
                            ? 'bg-[#22c55e] text-black font-bold' : 'text-slate-400'
                        }`}
                      >
                        STATIC
                      </button>
                      {openedPcId !== 'laptop' && (
                        <button 
                          onClick={() => {
                            playSound('click');
                            if (openedPcId === 'pc1') setPc1Ip(prev => ({ ...prev, mode: 'dhcp' }));
                            else if (openedPcId === 'pc2') setPc2Ip(prev => ({ ...prev, mode: 'dhcp' }));
                            else if (openedPcId === 'pc3') setPc3Ip(prev => ({ ...prev, mode: 'dhcp' }));
                          }}
                          className={`text-[10px] px-2.5 py-1 rounded ${
                            (openedPcId === 'pc1' && pc1Ip.mode === 'dhcp') ||
                            (openedPcId === 'pc2' && pc2Ip.mode === 'dhcp') ||
                            (openedPcId === 'pc3' && pc3Ip.mode === 'dhcp')
                              ? 'bg-[#22c55e] text-black font-bold' : 'text-slate-400'
                          }`}
                        >
                          DHCP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Config fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-extrabold">IP Address</label>
                      <input 
                        type="text"
                        value={openedPcId === 'pc1' ? pc1Ip.ip : openedPcId === 'pc2' ? pc2Ip.ip : openedPcId === 'pc3' ? pc3Ip.ip : laptopIp.ip}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (openedPcId === 'pc1') setPc1Ip(prev => ({ ...prev, ip: val }));
                          else if (openedPcId === 'pc2') setPc2Ip(prev => ({ ...prev, ip: val }));
                          else if (openedPcId === 'pc3') setPc3Ip(prev => ({ ...prev, ip: val }));
                          else if (openedPcId === 'laptop') setLaptopIp(prev => ({ ...prev, ip: val }));
                        }}
                        disabled={openedPcId !== 'laptop' && ((openedPcId === 'pc1' && pc1Ip.mode === 'dhcp') || (openedPcId === 'pc2' && pc2Ip.mode === 'dhcp') || (openedPcId === 'pc3' && pc3Ip.mode === 'dhcp'))}
                        className="w-full bg-black border border-white/15 rounded p-2 text-xs mono font-mono"
                        placeholder="Contoh: 192.168.1.2"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-extrabold">Subnet Mask</label>
                      <input 
                        type="text"
                        value={openedPcId === 'pc1' ? pc1Ip.mask : openedPcId === 'pc2' ? pc2Ip.mask : openedPcId === 'pc3' ? pc3Ip.mask : laptopIp.mask}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (openedPcId === 'pc1') setPc1Ip(prev => ({ ...prev, mask: val }));
                          else if (openedPcId === 'pc2') setPc2Ip(prev => ({ ...prev, mask: val }));
                          else if (openedPcId === 'pc3') setPc3Ip(prev => ({ ...prev, mask: val }));
                          else if (openedPcId === 'laptop') setLaptopIp(prev => ({ ...prev, mask: val }));
                        }}
                        disabled={openedPcId !== 'laptop' && ((openedPcId === 'pc1' && pc1Ip.mode === 'dhcp') || (openedPcId === 'pc2' && pc2Ip.mode === 'dhcp') || (openedPcId === 'pc3' && pc3Ip.mode === 'dhcp'))}
                        className="w-full bg-black border border-white/15 rounded p-2 text-xs mono font-mono"
                        placeholder="Contoh: 255.255.255.0"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-extrabold">Default Gateway</label>
                      <input 
                        type="text"
                        value={openedPcId === 'pc1' ? pc1Ip.gw : openedPcId === 'pc2' ? pc2Ip.gw : openedPcId === 'pc3' ? pc3Ip.gw : laptopIp.gw}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (openedPcId === 'pc1') setPc1Ip(prev => ({ ...prev, gw: val }));
                          else if (openedPcId === 'pc2') setPc2Ip(prev => ({ ...prev, gw: val }));
                          else if (openedPcId === 'pc3') setPc3Ip(prev => ({ ...prev, gw: val }));
                          else if (openedPcId === 'laptop') setLaptopIp(prev => ({ ...prev, gw: val }));
                        }}
                        disabled={openedPcId !== 'laptop' && ((openedPcId === 'pc1' && pc1Ip.mode === 'dhcp') || (openedPcId === 'pc2' && pc2Ip.mode === 'dhcp') || (openedPcId === 'pc3' && pc3Ip.mode === 'dhcp'))}
                        className="w-full bg-black border border-white/15 rounded p-2 text-xs mono font-mono"
                        placeholder="Contoh: 192.168.1.1"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 font-extrabold">DNS Server</label>
                      <input 
                        type="text"
                        value={openedPcId === 'pc1' ? pc1Ip.dns : openedPcId === 'pc2' ? pc2Ip.dns : openedPcId === 'pc3' ? pc3Ip.dns : laptopIp.dns}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (openedPcId === 'pc1') setPc1Ip(prev => ({ ...prev, dns: val }));
                          else if (openedPcId === 'pc2') setPc2Ip(prev => ({ ...prev, dns: val }));
                          else if (openedPcId === 'pc3') setPc3Ip(prev => ({ ...prev, dns: val }));
                          else if (openedPcId === 'laptop') setLaptopIp(prev => ({ ...prev, dns: val }));
                        }}
                        disabled={openedPcId !== 'laptop' && ((openedPcId === 'pc1' && pc1Ip.mode === 'dhcp') || (openedPcId === 'pc2' && pc2Ip.mode === 'dhcp') || (openedPcId === 'pc3' && pc3Ip.mode === 'dhcp'))}
                        className="w-full bg-black border border-white/15 rounded p-2 text-xs mono font-mono"
                        placeholder="Contoh: 8.8.8.8"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-4 font-mono leading-relaxed bg-black/30 p-2 rounded">
                    ℹ️ Konfigurasi ini disimpan otomatis secara dinamis ke simulator. Tutup dialog untuk kembali ke topologi jaringan.
                  </p>
                </div>
              )}

              {pcTab === 'desktop' && (
                <div className="h-full flex flex-col bg-[#050508] border border-white/10 rounded overflow-hidden">
                  
                  {/* Console screen logs */}
                  <div className="flex-1 p-4 mono text-[11px] text-[#22c55e] overflow-y-auto font-mono space-y-1">
                    {pcPromptLogs[openedPcId].map((log, idx) => (
                      <pre key={idx} className="whitespace-pre-wrap font-mono">{log}</pre>
                    ))}
                    <div ref={pcPromptBottomRef} />
                  </div>

                  {/* Console prompt form */}
                  <form onSubmit={(e) => handlePcPromptSubmit(e, openedPcId)} className="border-t border-white/10 bg-black flex items-center shrink-0">
                    <span className="text-[#22c55e] mono font-bold pl-3 pr-1 text-xs">C:\&gt;</span>
                    <input 
                      type="text"
                      value={pcPromptInput}
                      onChange={(e) => setPcPromptInput(e.target.value)}
                      placeholder="Masukkan perintah... (Contoh: 'ipconfig', 'ping 192.168.1.1')"
                      className="flex-1 bg-transparent px-2 py-2 text-white mono text-xs font-mono"
                      autoFocus
                    />
                  </form>
                </div>
              )}

              {pcTab === 'web' && (
                <div className="h-full flex flex-col bg-slate-900 border border-white/10 rounded overflow-hidden">
                  
                  {/* Browser URL Input Bar */}
                  <div className="bg-slate-800 p-2 flex gap-2 border-b border-white/15 items-center shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono">Address:</span>
                    <input 
                      type="text" 
                      value={webBrowserUrl} 
                      onChange={(e) => setWebBrowserUrl(e.target.value)}
                      className="flex-1 bg-black text-white text-xs px-2 py-1 rounded font-mono border border-white/5" 
                    />
                    <button 
                      onClick={() => playSound('click')}
                      className="text-xs bg-[#22c55e] hover:bg-green-400 text-black px-3 py-1 font-extrabold rounded"
                    >
                      GO
                    </button>
                  </div>

                  {/* Simulated web response page */}
                  <div className="flex-1 p-6 bg-slate-950 flex flex-col justify-center items-center text-center">
                    {connections.some(c => c.from === openedPcId || c.to === openedPcId) ? (
                      <div className="space-y-4 max-w-sm">
                        <Wifi className="w-12 h-12 text-[#22c55e] mx-auto animate-pulse" />
                        <h4 className="text-lg font-bold text-white">Selamat Datang di Portal Lab TKJ!</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Anda sukses tersambung ke Server Utama. IP Client Anda terdeteksi: 
                          <strong className="text-[#22c55e] ml-1">
                            {openedPcId === 'pc1' ? pc1Ip.ip : openedPcId === 'pc2' ? pc2Ip.ip : openedPcId === 'pc3' ? pc3Ip.ip : laptopIp.ip}
                          </strong>
                        </p>
                        <div className="p-3 bg-white/5 rounded border border-white/10 text-[10px] text-[#22c55e] mono font-mono uppercase tracking-widest font-bold">
                          HTTP STATUS 200: OK / SERVICE ONLINE
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-sm">
                        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                        <h4 className="text-md font-bold text-white">404: Jaringan Tidak Terjangkau</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Server tidak dapat diakses. Silakan periksa kembali apakah kabel LAN dari peranti Anda sudah terhubung ke Switch Utama dengan benar.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* DETAILED DIALOG: SWITCH NETWORK CONFIGURATION OVERLAY */}
      {openedSwitchId && (
        <div id="switch-dialog-overlay" className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-[620px] h-[520px] bg-[#15171b] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Title bar */}
            <div className="bg-slate-900/90 px-4 py-3 border-b border-[#22c55e]/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <Server className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono">Switch Utama - GUI Configuration</span>
              </div>
              <button 
                onClick={() => { playSound('click'); setOpenedSwitchId(false); }}
                className="text-slate-400 hover:text-white text-xs font-mono bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-[#191c22] border-b border-white/5 px-4 flex gap-1 pt-1.5 shrink-0">
              <button 
                onClick={() => { playSound('click'); setSwitchTab('vlan'); }}
                className={`text-xs px-3 py-1.5 rounded-t-lg font-mono flex items-center gap-1.5 transition-all ${
                  switchTab === 'vlan' ? 'bg-[#15171b] border-t border-x border-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" /> VLAN Database & Ports
              </button>
              <button 
                onClick={() => { playSound('click'); setSwitchTab('cli'); setCurrentCliTarget('switch'); }}
                className={`text-xs px-3 py-1.5 rounded-t-lg font-mono flex items-center gap-1.5 transition-all ${
                  switchTab === 'cli' ? 'bg-[#15171b] border-t border-x border-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" /> Cisco Switch CLI
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 bg-[#0c0e12]">
              {switchTab === 'vlan' ? (
                <div className="space-y-4 flex flex-col h-full">
                  
                  {/* Row 1: VLAN Database */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-[#22c55e] uppercase tracking-wider font-mono">1. VLAN Database Manager</h4>
                    <p className="text-[10px] text-slate-400 font-sans">Buat VLAN baru sebelum mengalokasikan port. Standar VLAN ID berkisar antara 1 - 4094.</p>
                    
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 mb-1">VLAN ID (Nomor)</label>
                        <input 
                          type="number" 
                          placeholder="Contoh: 10"
                          value={vlanIdInput}
                          onChange={(e) => setVlanIdInput(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#22c55e]/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 mb-1">Nama VLAN</label>
                        <input 
                          type="text" 
                          placeholder="Contoh: HR"
                          value={vlanNameInput}
                          onChange={(e) => setVlanNameInput(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#22c55e]/50 focus:outline-none"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const vid = parseInt(vlanIdInput);
                          if (isNaN(vid) || vid < 1 || vid > 4094) {
                            playSound('fail');
                            alert('VLAN ID harus berupa angka antara 1 dan 4094!');
                            return;
                          }
                          if (switchCreatedVlans.includes(vid)) {
                            playSound('fail');
                            alert(`VLAN ${vid} sudah ada!`);
                            return;
                          }
                          playSound('click');
                          setSwitchCreatedVlans(prev => [...prev, vid]);
                          setTerminalLogs(prev => [
                            ...prev, 
                            `[GUI CONFIG] Created VLAN ${vid} with name: ${vlanNameInput || `VLAN${vid}`}`
                          ]);
                          setVlanIdInput('');
                          setVlanNameInput('');
                        }}
                        className="bg-[#22c55e] hover:bg-green-400 text-black font-mono text-xs font-bold py-1.5 px-3 rounded flex items-center justify-center gap-1.5"
                      >
                        + Tambah VLAN
                      </button>
                    </div>

                    {/* Created VLANs list */}
                    <div className="mt-2">
                      <p className="text-[9px] font-mono text-slate-400 mb-1.5">VLAN Aktif di Switch:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {switchCreatedVlans.map(vid => (
                          <div key={vid} className="bg-black/40 border border-white/5 rounded px-2 py-0.5 text-[10px] font-mono text-white flex items-center gap-2">
                            <span className="text-[#22c55e]">VLAN {vid}</span>
                            <span className="text-slate-500">({vid === 1 ? 'default' : vid === 10 ? 'HR' : vid === 20 ? 'Finance' : 'Custom'})</span>
                            {vid !== 1 && (
                              <button 
                                onClick={() => {
                                  playSound('fail');
                                  setSwitchCreatedVlans(prev => prev.filter(v => v !== vid));
                                  // Reset ports configured with this VLAN
                                  setSwitchVlans(prev => {
                                    const updated = { ...prev };
                                    Object.keys(updated).forEach(p => {
                                      if (updated[p] === vid) updated[p] = 1;
                                    });
                                    return updated;
                                  });
                                  setTerminalLogs(prev => [...prev, `[GUI CONFIG] Deleted VLAN ${vid}`]);
                                }}
                                className="text-red-400 hover:text-red-300 ml-1"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Port Allocation */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 flex-1 flex flex-col min-h-0">
                    <h4 className="text-xs font-bold text-[#22c55e] uppercase tracking-wider font-mono">2. Alokasi Port Switch ke VLAN</h4>
                    <p className="text-[10px] text-slate-400 font-sans mb-2">Tentukan VLAN keanggotaan untuk port aktif di Switch Utama. Port PC HR harus berada di VLAN 10, Port Finance di VLAN 20.</p>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 max-h-48 pr-1">
                      {['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5', 'Fa0/6', 'Fa0/7', 'Fa0/8'].map((port) => {
                        const currentVlan = switchVlans[port] || 1;
                        return (
                          <div key={port} className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5 text-xs font-mono">
                            <div className="flex items-center gap-3">
                              <span className="text-[#22c55e] font-bold">{port}</span>
                              <span className="text-[10px] text-slate-500 font-sans">
                                {port === 'Fa0/1' || port === 'Fa0/2' ? '(PC-1 / PC-2 HR)' : port === 'Fa0/3' || port === 'Fa0/4' ? '(PC-3 Finance)' : '(Kosong)'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-400">VLAN:</span>
                              <select 
                                value={currentVlan}
                                onChange={(e) => {
                                  const vid = parseInt(e.target.value);
                                  playSound('click');
                                  setSwitchVlans(prev => ({ ...prev, [port]: vid }));
                                  setTerminalLogs(prev => [...prev, `[GUI CONFIG] Interface ${port} switched to VLAN ${vid}`]);
                                }}
                                className="bg-slate-900 border border-white/15 text-white text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-[#22c55e]/50"
                              >
                                {switchCreatedVlans.map(vid => (
                                  <option key={vid} value={vid}>
                                    VLAN {vid} ({vid === 1 ? 'default' : vid === 10 ? 'HR' : vid === 20 ? 'Finance' : 'Custom'})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                /* Embedded CLI Switch Tab */
                <div className="flex-1 flex flex-col min-h-0 bg-black rounded-lg border border-white/10 overflow-hidden">
                  <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0">
                    <span className="text-[10px] text-green-400 uppercase tracking-wider font-mono">Cisco IOS Switch Terminal</span>
                    <span className="text-[9px] text-slate-500 font-mono">Mode: {cliMode.toUpperCase()}</span>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
                    {terminalLogs.map((log, idx) => (
                      <pre key={idx} className="whitespace-pre-wrap font-mono break-all">{log}</pre>
                    ))}
                    <div ref={terminalBottomRef} />
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCliSubmit(e);
                    }}
                    className="border-t border-white/10 bg-black flex items-center shrink-0"
                  >
                    <span className="text-green-500 font-bold pl-3 pr-1 text-xs font-mono">
                      {currentCliTarget === 'switch' ? 'Switch' : 'Router'}
                      {cliMode === 'conf' ? '(config)' : cliMode === 'interface' ? '(config-if)' : cliMode === 'dhcp' ? '(config-dhcp)' : cliMode === 'vlan' ? '(config-vlan)' : ''}
                      {cliMode === 'user' ? '>' : '#'}
                    </span>
                    <input 
                      type="text" 
                      value={cliInput}
                      onChange={(e) => setCliInput(e.target.value)}
                      placeholder="Ketik perintah Switch di sini..."
                      className="flex-1 bg-transparent border-none text-green-400 font-mono text-xs p-2.5 outline-none focus:ring-0"
                    />
                  </form>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-[#191c22] border-t border-white/5 px-4 py-3 flex justify-between items-center shrink-0">
              <p className="text-[10px] text-slate-400 font-sans">
                💡 Tips: Anda bisa menggunakan GUI di tab sebelah kiri untuk konfigurasi instan!
              </p>
              <button 
                onClick={() => { playSound('click'); setOpenedSwitchId(false); }}
                className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 px-4 py-1.5 rounded text-xs font-bold font-mono hover:bg-[#22c55e] hover:text-black transition-all"
              >
                Selesai & Simpan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED DIALOG: ROUTER NETWORK CONFIGURATION OVERLAY */}
      {openedRouterId && (
        <div id="router-dialog-overlay" className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-[620px] h-[520px] bg-[#15171b] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Title bar */}
            <div className="bg-slate-900/90 px-4 py-3 border-b border-[#22c55e]/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono">Router Utama - GUI Configuration</span>
              </div>
              <button 
                onClick={() => { playSound('click'); setOpenedRouterId(false); }}
                className="text-slate-400 hover:text-white text-xs font-mono bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-[#191c22] border-b border-white/5 px-4 flex gap-1 pt-1.5 shrink-0">
              <button 
                onClick={() => { playSound('click'); setRouterTab('dhcp'); }}
                className={`text-xs px-3 py-1.5 rounded-t-lg font-mono flex items-center gap-1.5 transition-all ${
                  routerTab === 'dhcp' ? 'bg-[#15171b] border-t border-x border-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" /> DHCP Server Pool
              </button>
              <button 
                onClick={() => { playSound('click'); setRouterTab('acl'); }}
                className={`text-xs px-3 py-1.5 rounded-t-lg font-mono flex items-center gap-1.5 transition-all ${
                  routerTab === 'acl' ? 'bg-[#15171b] border-t border-x border-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Security ACL Firewall
              </button>
              <button 
                onClick={() => { playSound('click'); setRouterTab('cli'); setCurrentCliTarget('router'); }}
                className={`text-xs px-3 py-1.5 rounded-t-lg font-mono flex items-center gap-1.5 transition-all ${
                  routerTab === 'cli' ? 'bg-[#15171b] border-t border-x border-white/10 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" /> Cisco Router CLI
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 bg-[#0c0e12]">
              {routerTab === 'dhcp' ? (
                <div className="space-y-4">
                  
                  {/* DHCP Panel */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-[#22c55e] uppercase tracking-wider font-mono">Konfigurasi DHCP Server (Misi 4)</h4>
                    <p className="text-[10px] text-slate-400 font-sans">Aktifkan Router Utama sebagai DHCP Server agar PC Client mendapatkan IP Address dinamis secara otomatis.</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 mb-1">Nama Pool DHCP (IP DHCP Pool)</label>
                        <input 
                          type="text" 
                          value={dhcpPoolNameInput}
                          onChange={(e) => setDhcpPoolNameInput(e.target.value)}
                          className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#22c55e]/50 focus:outline-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 mb-1">Network Subnet</label>
                          <input 
                            type="text" 
                            value={dhcpNetworkInput}
                            onChange={(e) => setDhcpNetworkInput(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#22c55e]/50 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 mb-1">Default Gateway Router IP</label>
                          <input 
                            type="text" 
                            value={dhcpGatewayInput}
                            onChange={(e) => setDhcpGatewayInput(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#22c55e]/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button 
                          onClick={() => {
                            if (!dhcpPoolNameInput.trim() || !dhcpNetworkInput.trim() || !dhcpGatewayInput.trim()) {
                              playSound('fail');
                              alert('Semua bidang parameter DHCP harus diisi!');
                              return;
                            }
                            playSound('click');
                            setRouterDhcpPool({
                              active: true,
                              network: dhcpNetworkInput,
                              gateway: dhcpGatewayInput
                            });
                            setTerminalLogs(prev => [
                              ...prev,
                              `[GUI CONFIG] DHCP Pool "${dhcpPoolNameInput}" initialized.`,
                              `[GUI CONFIG] Network configured: ${dhcpNetworkInput} 255.255.255.0`,
                              `[GUI CONFIG] Default gateway: ${dhcpGatewayInput}`
                            ]);
                          }}
                          className="flex-1 bg-[#22c55e] hover:bg-green-400 text-black font-mono text-xs font-bold py-2 rounded flex items-center justify-center gap-1.5"
                        >
                          ⚡ Aktifkan DHCP Pool Server
                        </button>
                        {routerDhcpPool.active && (
                          <button 
                            onClick={() => {
                              playSound('fail');
                              setRouterDhcpPool({ active: false, network: '', gateway: '' });
                              setTerminalLogs(prev => [...prev, `[GUI CONFIG] DHCP Pool disabled / removed.`]);
                            }}
                            className="bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/30 font-mono text-xs font-bold py-2 px-4 rounded"
                          >
                            Nonaktifkan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current DHCP State status banner */}
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-sans">Status Server DHCP:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${routerDhcpPool.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {routerDhcpPool.active ? '🟢 ACTIVE' : '🔴 DISABLED / NO POOL'}
                    </span>
                  </div>

                </div>
              ) : routerTab === 'acl' ? (
                <div className="space-y-4">
                  
                  {/* ACL Rules Setup */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-[#22c55e] uppercase tracking-wider font-mono">Access Control List (ACL) - Misi 5</h4>
                    <p className="text-[10px] text-slate-400 font-sans">Blokir trafik SSH (port 22) dari IP penyerang 10.10.10.50 menuju ke Web Server 192.168.1.100.</p>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 mb-1">Source IP Address (IP Penyerang)</label>
                          <input 
                            type="text" 
                            value={aclSourceInput}
                            onChange={(e) => setAclSourceInput(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#22c55e]/50 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-400 mb-1">Destination IP Address (Server Utama)</label>
                          <input 
                            type="text" 
                            value={aclDestInput}
                            onChange={(e) => setAclDestInput(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:border-[#22c55e]/50 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            playSound('click');
                            setRouterAcl(prev => [...prev, { type: 'deny', src: aclSourceInput, dst: aclDestInput, port: 22 }]);
                            setTerminalLogs(prev => [...prev, `[GUI CONFIG] Added ACL rule: deny tcp host ${aclSourceInput} host ${aclDestInput} eq 22`]);
                          }}
                          className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-mono text-xs font-bold py-1.5 px-3 rounded text-center"
                        >
                          🚫 Blokir SSH (Port 22) dari {aclSourceInput}
                        </button>
                        <button 
                          onClick={() => {
                            playSound('click');
                            setRouterAcl(prev => [...prev, { type: 'permit', src: 'any', dst: 'any' }]);
                            setTerminalLogs(prev => [...prev, `[GUI CONFIG] Added ACL rule: permit ip any any`]);
                          }}
                          className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-mono text-xs font-bold py-1.5 px-3 rounded"
                        >
                          ✅ Izinkan IP Any Any
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Current Active ACL rules list */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-300 font-mono">Daftar Aturan ACL Aktif (access-list 101)</h4>
                      {routerAcl.length > 0 && (
                        <button 
                          onClick={() => {
                            playSound('fail');
                            setRouterAcl([]);
                            setTerminalLogs(prev => [...prev, `[GUI CONFIG] Cleared all ACL Rules (no access-list 101)`]);
                          }}
                          className="text-[10px] text-red-400 hover:underline font-mono"
                        >
                          Hapus Semua
                        </button>
                      )}
                    </div>
                    
                    {routerAcl.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic py-1 text-center font-sans">Belum ada aturan ACL terkonfigurasi.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {routerAcl.map((rule, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5 text-[11px] font-mono">
                            <span className={rule.type === 'deny' ? 'text-red-400' : 'text-green-400'}>
                              {rule.type.toUpperCase()}: Source {rule.src} ➔ Dest {rule.dst} {rule.port ? `(Port ${rule.port})` : ''}
                            </span>
                            <button 
                              onClick={() => {
                                playSound('fail');
                                setRouterAcl(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-slate-500 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Apply ACL to Interface */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 font-mono">Terapkan ACL ke Interface Router</h4>
                    <p className="text-[10px] text-slate-400 font-sans">Agar ACL berfungsi, terapkan ke interface GigabitEthernet0/0 pada arah "Inbound (in)".</p>
                    
                    <div className="grid grid-cols-2 gap-3 items-end">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-400 mb-1">Pilih Interface</label>
                        <select 
                          value={routerAclApplied?.interface || 'Gi0/0'} 
                          onChange={(e) => setRouterAclApplied(prev => prev ? { ...prev, interface: e.target.value } : { interface: e.target.value, direction: 'in' })}
                          className="w-full bg-black border border-white/15 text-white text-xs font-mono rounded px-2.5 py-1.5 focus:outline-none focus:border-[#22c55e]/50"
                        >
                          <option value="Gi0/0 font-mono">Gi0/0 (Fast Local LAN)</option>
                          <option value="Console font-mono">Console Interface</option>
                        </select>
                      </div>
                      <div className="flex gap-2 font-mono text-xs">
                        <button 
                          onClick={() => {
                            playSound('click');
                            setRouterAclApplied({ interface: 'Gi0/0', direction: 'in' });
                            setTerminalLogs(prev => [...prev, `[GUI CONFIG] Applied ACL 101 in on interface Gi0/0`]);
                          }}
                          className="flex-1 bg-[#22c55e] hover:bg-green-400 text-black font-bold py-1.5 rounded"
                        >
                          Terapkan ACL Gi0/0 (IN)
                        </button>
                        {routerAclApplied && (
                          <button 
                            onClick={() => {
                              playSound('fail');
                              setRouterAclApplied(null);
                              setTerminalLogs(prev => [...prev, `[GUI CONFIG] Removed ACL filter from interface.`]);
                            }}
                            className="bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/30 font-bold py-1.5 px-3 rounded"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </div>

                    {routerAclApplied && (
                      <div className="text-[10px] text-green-400 font-mono bg-green-950/20 border border-green-500/20 p-2 rounded flex items-center gap-1.5">
                        <span>🔒 Status: ACL 101 telah diterapkan pada interface {routerAclApplied.interface} arah {routerAclApplied.direction.toUpperCase()}!</span>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Embedded CLI Router Tab */
                <div className="flex-1 flex flex-col min-h-0 bg-black rounded-lg border border-white/10 overflow-hidden">
                  <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0">
                    <span className="text-[10px] text-green-400 uppercase tracking-wider font-mono">Cisco IOS Router Terminal</span>
                    <span className="text-[9px] text-slate-500 font-mono">Mode: {cliMode.toUpperCase()}</span>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
                    {terminalLogs.map((log, idx) => (
                      <pre key={idx} className="whitespace-pre-wrap font-mono break-all">{log}</pre>
                    ))}
                    <div ref={terminalBottomRef} />
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleCliSubmit(e);
                    }}
                    className="border-t border-white/10 bg-black flex items-center shrink-0"
                  >
                    <span className="text-green-500 font-bold pl-3 pr-1 text-xs font-mono">
                      {currentCliTarget === 'switch' ? 'Switch' : 'Router'}
                      {cliMode === 'conf' ? '(config)' : cliMode === 'interface' ? '(config-if)' : cliMode === 'dhcp' ? '(config-dhcp)' : cliMode === 'vlan' ? '(config-vlan)' : ''}
                      {cliMode === 'user' ? '>' : '#'}
                    </span>
                    <input 
                      type="text" 
                      value={cliInput}
                      onChange={(e) => setCliInput(e.target.value)}
                      placeholder="Ketik perintah Router di sini..."
                      className="flex-1 bg-transparent border-none text-green-400 font-mono text-xs p-2.5 outline-none focus:ring-0"
                    />
                  </form>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-[#191c22] border-t border-white/5 px-4 py-3 flex justify-between items-center shrink-0">
              <p className="text-[10px] text-slate-400 font-sans">
                💡 Tips: Anda bisa menggunakan GUI di tab sebelah kiri untuk konfigurasi instan!
              </p>
              <button 
                onClick={() => { playSound('click'); setOpenedRouterId(false); }}
                className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 px-4 py-1.5 rounded text-xs font-bold font-mono hover:bg-[#22c55e] hover:text-black transition-all"
              >
                Selesai & Simpan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* UTP CRIMPING LAB MODAL OVERLAY */}
      {isCrimpingOpen && (
        <div id="crimping-modal-overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div id="crimping-modal-container" className="bg-[#0e1115] border border-yellow-500/30 rounded-2xl p-6 max-w-4xl w-full text-slate-300 relative shadow-2xl shadow-yellow-500/5 flex flex-col md:flex-row gap-6">
            
            {/* Close Button */}
            <button 
              onClick={() => { playSound('click'); setIsCrimpingOpen(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer text-xl font-bold font-mono p-1"
            >
              ✕
            </button>

            {/* Left Column: Interactive RJ45 Plug */}
            <div className="flex-1 flex flex-col items-center justify-center bg-black/40 rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-extrabold text-white mb-2 uppercase tracking-wide flex items-center gap-2">
                <Network className="w-4 h-4 text-yellow-500" />
                Soket RJ-45 & Kawat Pin
              </h3>
              <p className="text-[10px] text-slate-500 mb-6 text-center leading-relaxed">
                Urutan Pin 1 (Kiri) sampai Pin 8 (Kanan). Klik Slot untuk menaruh kawat. Klik kawat terpasang untuk melepasnya kembali.
              </p>

              {/* RJ-45 Connector Mockup Illustration */}
              <div className="relative w-72 h-80 bg-slate-800/10 border border-slate-700/50 rounded-2xl flex flex-col justify-between p-4 overflow-hidden">
                {/* Copper Contacts */}
                <div className="grid grid-cols-8 gap-1 px-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 font-mono font-bold mb-1">{i+1}</span>
                      <div className="w-4 h-3 bg-yellow-600 rounded-t border-b border-yellow-700 flex items-center justify-center">
                        <div className="w-0.5 h-full bg-yellow-300" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vertical tracks inside the plug */}
                <div className="grid grid-cols-8 gap-1 px-2 h-52 bg-[#12141a]/80 rounded-xl p-1.5 relative">
                  {[...Array(8)].map((_, i) => {
                    const assignedColor = crimpPins[i];
                    return (
                      <div 
                        key={i} 
                        onClick={() => handleSlotClick(i)}
                        className={`group relative flex flex-col items-center justify-end h-full rounded cursor-pointer transition-all ${
                          assignedColor 
                            ? WIRE_STYLES[assignedColor] 
                            : 'bg-slate-900/50 border border-dashed border-white/10 hover:border-yellow-500/40 hover:bg-yellow-500/5'
                        }`}
                        title={assignedColor ? `Pin ${i+1}: ${assignedColor}` : `Pin ${i+1}: Klik untuk pasang kawat`}
                      >
                        {assignedColor ? (
                          <>
                            {/* Inner stripe effect */}
                            <div className="w-full h-full flex flex-col justify-end pb-1 overflow-hidden rounded-sm">
                              <span className="text-[6.5px] font-black text-center select-none font-mono tracking-tighter drop-shadow-md">
                                {assignedColor.substring(0, 2)}
                              </span>
                            </div>
                            {/* Clear indicator */}
                            <span className="absolute inset-0 bg-red-600/0 hover:bg-red-600/25 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 text-[10px] rounded transition-all">
                              ✕
                            </span>
                          </>
                        ) : (
                          <span className="text-[8px] text-slate-600 font-mono font-bold mb-2 select-none group-hover:text-yellow-500">
                            +
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* RJ-45 Tab Click Lock */}
                <div className="w-20 h-8 bg-slate-700/20 border border-slate-600/30 rounded-b-lg mx-auto flex items-center justify-center">
                  <div className="w-14 h-3 bg-slate-700/40 border border-slate-600 rounded-sm" />
                </div>
              </div>

              {/* Selection State Indicator */}
              <div className="mt-4 w-full text-center">
                {selectedWireColor ? (
                  <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full text-[11px] text-yellow-400">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                    Kawat Terpilih: <strong>{selectedWireColor}</strong>. Klik Slot Pin RJ-45 untuk memasang.
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 font-medium">
                    💡 Pilih salah satu kawat warna di samping, lalu klik salah satu Pin RJ-45 di atas.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Reference & Actions */}
            <div className="w-full md:w-96 flex flex-col justify-between bg-black/20 rounded-xl p-5 border border-white/5">
              <div>
                <h3 className="text-sm font-extrabold text-white mb-2 uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-500" />
                  Standar T568B Straight
                </h3>
                
                {/* Standard Color Cheat Sheet */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#0a0c10] border border-white/5 rounded-xl text-[10px] font-mono leading-relaxed mb-4">
                  <div>
                    <p className="text-yellow-500 font-bold mb-1 border-b border-white/5 pb-0.5">PIN 1 - 4</p>
                    <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> 1. Putih-Oranye</p>
                    <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> 2. Oranye</p>
                    <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /> 3. Putih-Hijau</p>
                    <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> 4. Biru</p>
                  </div>
                  <div>
                    <p className="text-yellow-500 font-bold mb-1 border-b border-white/5 pb-0.5">PIN 5 - 8</p>
                    <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 5. Putih-Biru</p>
                    <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600" /> 6. Hijau</p>
                    <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-800" /> 7. Putih-Cokelat</p>
                    <p className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-900" /> 8. Cokelat</p>
                  </div>
                </div>

                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 font-sans">Kawat Kabel UTP</h3>
                
                {/* Available Wire Wires */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {CRIMP_COLORS.map((color) => {
                    const isPlaced = crimpPins.includes(color);
                    return (
                      <button
                        key={color}
                        onClick={() => handleSelectWire(color)}
                        disabled={isPlaced && selectedWireColor !== color}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer border ${
                          selectedWireColor === color 
                            ? 'ring-2 ring-yellow-400 border-yellow-400 scale-[1.02] shadow-md shadow-yellow-400/10' 
                            : 'border-white/5 hover:border-white/15'
                        } ${
                          isPlaced 
                            ? 'opacity-30 bg-slate-900 text-slate-500 border-transparent cursor-not-allowed' 
                            : 'bg-[#15171b] hover:bg-[#1a1e26] text-slate-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className={`w-3 h-3 rounded ${WIRE_STYLES[color]}`} />
                          {color}
                        </span>
                        {!isPlaced && (
                          <span className="text-[8px] bg-white/5 text-slate-400 px-1 rounded">Pilih</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-4 border-t border-white/5 mt-auto">
                {isCrimpingSuccess ? (
                  <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center text-xs text-green-400 font-medium">
                    🎉 Crimping Sukses! Kabel Straight T568B Anda sempurna. Sekarang Anda bisa memasangnya ke topologi.
                  </div>
                ) : crimpingError ? (
                  <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-xs text-red-400 font-medium font-mono">
                    ⚠️ {crimpingError}
                  </div>
                ) : null}

                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      playSound('click');
                      setCrimpPins(['', '', '', '', '', '', '', '']);
                      setSelectedWireColor(null);
                      setCrimpingError(null);
                      setIsCrimpingSuccess(false);
                    }}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs rounded-xl border border-white/10 transition-colors cursor-pointer font-mono"
                  >
                    RESET
                  </button>
                  <button
                    onClick={handleVerifyCrimping}
                    disabled={isCrimpingSuccess}
                    className="flex-2 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-extrabold text-xs rounded-xl tracking-wider transition-all cursor-pointer font-mono shadow-lg shadow-yellow-500/15"
                  >
                    CRIMP KABEL!
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SUCCESS MODAL POPUP */}
      {showSuccessModal && successModalData && (
        <div id="success-modal-overlay" className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
          <div id="success-modal-container" className="bg-[#111317] border-2 border-[#22c55e]/40 rounded-2xl p-8 max-w-lg w-full text-center relative overflow-hidden shadow-2xl shadow-green-500/10">
            {/* Glowing background highlights */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-500/10 border-2 border-[#22c55e] rounded-full flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle className="w-10 h-10 text-[#22c55e]" />
            </div>
            
            <p className="text-[10px] text-[#22c55e] uppercase tracking-widest font-mono font-bold mb-1">Praktikum Berhasil Diselesaikan</p>
            <h3 className="text-2xl font-extrabold text-white mb-2 leading-tight">
              {successModalData.title}
            </h3>
            
            {/* XP Award Badge */}
            <div className="my-6 inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/20 px-6 py-2.5 rounded-full shadow-inner">
              <span className="text-sm font-bold text-slate-300">Reward:</span>
              <span className="text-xl font-black text-[#22c55e] font-mono tracking-wide">+{successModalData.xpReward} XP</span>
            </div>

            {/* Congratulatory message */}
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
              Luar biasa! Anda telah berhasil menyelesaikan semua tugas operasional untuk modul simulasi ini dengan sempurna. Kemampuan Anda dalam manajemen infrastruktur jaringan SMK TKJ terus meningkat!
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                id="btn-lobby"
                onClick={() => {
                  playSound('click');
                  setShowSuccessModal(false);
                  setCurrentScreen('lobby');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Kembali ke Lobby
              </button>
              
              {successModalData.id < MISSIONS_DATA.length ? (
                <button
                  id="btn-next-mission"
                  onClick={handleNextMission}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#22c55e] hover:bg-[#1ebd53] text-black font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 cursor-pointer"
                >
                  Lanjut ke Misi Berikutnya <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="btn-finished-all"
                  onClick={() => {
                    playSound('success');
                    setShowSuccessModal(false);
                    setCurrentScreen('lobby');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-yellow-500/20 cursor-pointer"
                >
                  🏆 Selesai Semua Misi!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WELCOME SPLASH POPUP OVERLAY */}
      {showWelcomeSplash && (
        <div id="welcome-splash-overlay" className="fixed inset-0 bg-[#07090e]/95 backdrop-blur-xl flex items-center justify-center z-[60] p-4 font-sans animate-fade-in">
          <div id="welcome-splash-container" className="bg-[#0e1115] border border-green-500/35 rounded-2xl p-8 max-w-lg w-full text-center relative shadow-2xl shadow-green-500/10 flex flex-col items-center justify-center gap-6 overflow-hidden">
            
            {/* Glowing neon background decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-lg shadow-green-500/50" />
            
            {/* Circular network animated rings */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 mb-2">
              <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping opacity-60" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full border border-green-500/10 animate-pulse" />
              <Network className="w-10 h-10 text-green-400" />
            </div>

            {/* Typography pairings */}
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 tracking-wider font-mono">
                GameJar
              </h1>
              <p className="text-[10px] font-extrabold tracking-[0.25em] text-slate-400 font-mono uppercase bg-white/5 py-1 px-4 rounded-full border border-white/5 shadow-inner">
                By Nana Permana
              </p>
            </div>

            {/* Description */}
            <div className="text-slate-400 text-xs max-w-sm leading-relaxed text-center">
              Aplikasi Media Pembelajaran Interaktif & Simulasi Praktikum Jaringan Komputer untuk siswa SMK Teknik Komputer & Jaringan (TKJ).
            </div>

            {/* Decorative system scanner divider */}
            <div className="w-full flex items-center gap-4 px-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-green-500/20" />
              <span className="text-[8px] text-green-500 font-mono uppercase tracking-widest animate-pulse">SYSTEM SECURE</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-green-500/20" />
            </div>

            {/* Tech badges */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm text-left">
              <div className="p-3 bg-[#12151c] rounded-xl border border-white/5 flex flex-col gap-0.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Jenis Platform</span>
                <span className="text-xs font-bold text-slate-200 font-mono">CCNA / TKJ Simulator</span>
              </div>
              <div className="p-3 bg-[#12151c] rounded-xl border border-white/5 flex flex-col gap-0.5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Ketersediaan</span>
                <span className="text-xs font-bold text-green-400 font-mono">Offline-First Lab</span>
              </div>
            </div>

            {/* Call to Action pulsing button */}
            <button
              onClick={() => {
                playSound('success');
                setShowWelcomeSplash(false);
              }}
              className="w-full max-w-sm py-4 px-6 bg-green-500 hover:bg-green-400 text-black font-extrabold text-xs rounded-xl tracking-widest transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center justify-center gap-2.5 cursor-pointer font-mono"
            >
              <Play className="w-4 h-4 fill-black text-black animate-pulse" /> LANJUTKAN SIMULASI
            </button>

          </div>
        </div>
      )}

      {/* FOOTER BAR */}
      <footer className="h-8 bg-[#15171b] border-t border-white/10 px-4 flex items-center justify-between text-[9px] text-slate-500 mono shrink-0 font-mono z-10">
        <div className="flex items-center gap-6">
          <span>LAB_SESSION_ID: GJ-SMK-2026</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full server-led" /> INTERNET GATEWAY DETECTED
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full server-led" /> DATABASE CONNECTED
          </span>
        </div>
        <div>
          <span>© 2026 GAMEJAR NETWORK ACADEMY // INDONESIA</span>
        </div>
      </footer>

    </div>
  );
}
