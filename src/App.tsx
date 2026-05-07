import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, Beer, RotateCcw, ChevronRight, Zap, PartyPopper } from 'lucide-react';

// Game States
enum GameState {
  PICKING = 'PICKING',
  OPENING = 'OPENING',
  REVEALED = 'REVEALED'
}

type Brand = 'SAGRES' | 'HEINEKEN';

interface PrizeTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  isWinner: boolean;
  intensity: 'low' | 'med' | 'high' | 'none';
}

const PRIZE_TEMPLATES: PrizeTemplate[] = [
  { id: 'fino1', title: '1 Fino de Oferta', subtitle: 'Brinde Especial', icon: Beer, isWinner: true, intensity: 'low' },
  { id: 'fino3', title: '3 Finos de Oferta', subtitle: 'Sorte a triplicar!', icon: Beer, isWinner: true, intensity: 'med' },
  { id: 'regua', title: '1 RÉGUA DE OFERTA', subtitle: 'O GRANDE PRÉMIO!', icon: Trophy, isWinner: true, intensity: 'high' },
  { id: 'retry1', title: 'Sem Prémio', subtitle: 'Mais sorte no próximo pedido', icon: RotateCcw, isWinner: false, intensity: 'none' },
  { id: 'retry2', title: 'Sem Prémio', subtitle: 'Tenta outra vez!', icon: RotateCcw, isWinner: false, intensity: 'none' },
];

const getShuffledPrizes = (brand: Brand) => {
  const arr = PRIZE_TEMPLATES.map(p => ({
    ...p,
    brand,
    displayTitle: p.isWinner ? `${p.title} (${brand})` : p.title
  }));
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function App() {
  const [brand, setBrand] = useState<Brand>('HEINEKEN');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.PICKING);
  const [prizes, setPrizes] = useState(() => getShuffledPrizes('HEINEKEN'));
  const [lastPrize, setLastPrize] = useState<any | null>(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  const shufflePrizes = useCallback((newBrand: Brand = brand) => {
    setPrizes(getShuffledPrizes(newBrand));
  }, [brand]);

  const handleOpen = useCallback(() => {
    if (gameState !== GameState.PICKING) return;
    
    setSelectedBoxIndex(focusedIndex);
    setGameState(GameState.OPENING);

    setTimeout(() => {
      const winner = prizes[focusedIndex];
      setGameState(GameState.REVEALED);
      setLastPrize(winner);
      
      if (winner.isWinner) {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 500);
      }
    }, 1200);
  }, [gameState, focusedIndex, prizes]);

  const resetGame = useCallback(() => {
    shufflePrizes();
    setGameState(GameState.PICKING);
    setSelectedBoxIndex(null);
  }, [shufflePrizes]);

  // Keyboard/Remote Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Brand with a specific key (e.g., 'b')
      if (e.key.toLowerCase() === 'b') {
        const nextBrand = brand === 'HEINEKEN' ? 'SAGRES' : 'HEINEKEN';
        setBrand(nextBrand);
        shufflePrizes(nextBrand);
        return;
      }

      if (gameState === GameState.REVEALED) {
        if (e.key === 'Enter' || e.key === 'OK' || e.key === 'Select') {
          resetGame();
        }
        return;
      }

      if (gameState !== GameState.PICKING) return;

      switch (e.key) {
        case 'ArrowLeft':
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : 4));
          break;
        case 'ArrowRight':
          setFocusedIndex(prev => (prev < 4 ? prev + 1 : 0));
          break;
        case 'Enter':
        case 'OK':
        case 'Select':
          handleOpen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleOpen, resetGame, focusedIndex, brand, shufflePrizes]);

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col font-sans bg-[#050d08] ${showFlash ? 'shake-screen' : ''}`}>
      {/* Screen Flash Effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white"
          />
        )}
      </AnimatePresence>

      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] transition-colors duration-1000 ${brand === 'HEINEKEN' ? 'bg-[radial-gradient(circle,rgba(0,129,48,0.4)_0%,transparent_70%)]' : 'bg-[radial-gradient(circle,rgba(255,43,0,0.3)_0%,transparent_70%)]'}`} />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 px-8 py-6 flex justify-between items-center border-b border-white/5 bg-black">
        <div className="flex flex-col">
          <span className="text-xs font-black tracking-widest text-[#bfd0c2] uppercase opacity-70">Cheers O Bar</span>
          <h1 className="text-4xl font-black text-white leading-tight">5 CAIXAS DA SORTE</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
          <button 
            onClick={() => { setBrand('SAGRES'); shufflePrizes('SAGRES'); }}
            className={`px-4 py-2 rounded-lg font-black transition-all ${brand === 'SAGRES' ? 'bg-[#ff2b00] text-white scale-105' : 'text-white/40'}`}
          >
            SAGRES
          </button>
          <button 
            onClick={() => { setBrand('HEINEKEN'); shufflePrizes('HEINEKEN'); }}
            className={`px-4 py-2 rounded-lg font-black transition-all ${brand === 'HEINEKEN' ? 'bg-[#008130] text-white scale-105' : 'text-white/40'}`}
          >
            HEINEKEN
          </button>
        </div>

        <div className="text-right flex flex-col">
          <span className="text-xs font-black tracking-widest text-[#bfd0c2] uppercase opacity-70">Último Prémio</span>
          <span className="text-xl font-bold text-[#f2d47a]">{lastPrize ? lastPrize.displayTitle : 'Boa Sorte!'}</span>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-lg font-bold text-white/90">
            <Zap className={`w-5 h-5 ${brand === 'HEINEKEN' ? 'text-[#008130]' : 'text-[#ff2b00]'} fill-current`} />
            PEDE UMA RÉGUA DE {brand} PARA PARTICIPAR
            <Zap className={`w-5 h-5 ${brand === 'HEINEKEN' ? 'text-[#008130]' : 'text-[#ff2b00]'} fill-current`} />
          </div>
          <p className="mt-4 text-xl font-medium text-white/60 uppercase tracking-widest">
            {gameState === GameState.PICKING ? 'Qual será a caixa com a régua grátis?' : 'Processando sorteio...'}
          </p>
        </div>

        {/* Boxes Grid */}
        <div className="grid grid-cols-5 gap-6 w-full max-w-7xl">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div key={idx} className="relative aspect-[4/5] flex flex-col items-center">
              <motion.div
                animate={{
                  scale: focusedIndex === idx ? 1.08 : 0.95,
                  y: focusedIndex === idx ? -15 : 0,
                  rotateZ: focusedIndex === idx ? [0, -1, 1, 0] : 0
                }}
                transition={{
                  rotateZ: focusedIndex === idx ? { repeat: Infinity, duration: 2 } : {}
                }}
                className={`w-full h-full rounded-2xl border-4 transition-all duration-300 overflow-hidden relative shadow-2xl
                  ${focusedIndex === idx 
                    ? 'border-white shadow-[0_0_50px_rgba(255,255,255,0.3)] z-20' 
                    : 'border-white/10 opacity-80'
                  }
                  ${selectedBoxIndex === idx && gameState === GameState.OPENING ? 'animate-bounce' : ''}
                  bg-gradient-to-br from-[#11261a] to-black
                `}
              >
                {/* Visual Content based on brand */}
                <div className={`absolute inset-0 opacity-20 ${brand === 'HEINEKEN' ? 'bg-[#008130]' : 'bg-[#ff2b00]'}`} />
                
                <div className="absolute inset-x-3 top-3 h-10 rounded-xl border border-white/10 bg-white/5" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-[10px] font-black opacity-40 uppercase mb-1">BOX {idx + 1}</span>
                  <div className="text-3xl font-black italic tracking-tighter flex flex-col items-center">
                    <span className="text-white">CHEERS</span>
                    <Star className={`w-8 h-8 ${brand === 'HEINEKEN' ? 'text-[#008130]' : 'text-[#ff2b00]'} fill-current`} />
                  </div>
                </div>

                {/* Focus Arrow */}
                {focusedIndex === idx && gameState === GameState.PICKING && (
                  <motion.div 
                    layoutId="cursor"
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[24px] border-b-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                  />
                )}
              </motion.div>
              <div className="w-2/3 h-4 bg-black/50 blur-xl rounded-full mt-4" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 p-6 grid grid-cols-3 gap-6">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${brand === 'HEINEKEN' ? 'bg-[#008130]/20 text-[#008130]' : 'bg-[#ff2b00]/20 text-[#ff2b00]'}`}>
            <ChevronRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Modo Ativo</span>
            <p className="text-base font-black text-white uppercase">Sorteio {brand}</p>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 justify-center">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#f2d47a] flex items-center justify-center border-2 border-black"><Star size={14} fill="black" /></div>
            <div className="w-8 h-8 rounded-full bg-[#008130] flex items-center justify-center border-2 border-black"><Beer size={14} color="white" /></div>
            <div className="w-8 h-8 rounded-full bg-[#ff2b00] flex items-center justify-center border-2 border-black"><Trophy size={14} color="white" /></div>
          </div>
          <p className="text-base font-black text-white uppercase tracking-tight">Vários Prémios em Jogo</p>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 justify-end text-right">
          <div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Comando TV</span>
            <p className="text-base font-black text-white uppercase">OK para Ganhar</p>
          </div>
          <div className="w-12 h-10 rounded-lg bg-white/10 flex items-center justify-center font-black text-white border border-white/10">OK</div>
        </div>
      </footer>

      {/* Result Overlay */}
      <AnimatePresence>
        {gameState === GameState.REVEALED && lastPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
          >
            {/* Win Explosion Background */}
            {lastPrize.isWinner && (
              <motion.div 
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`absolute inset-0 z-0 ${lastPrize.brand === 'HEINEKEN' ? 'bg-[#008130]/20' : 'bg-[#ff2b00]/20'} blur-[100px]`}
              />
            )}

            <motion.div
              initial={{ scale: 0.5, y: 100, rotate: -5 }}
              animate={{ 
                scale: 1, 
                y: 0, 
                rotate: 0,
                transition: { type: "spring", damping: 12, stiffness: 100 }
              }}
              className={`relative z-10 w-full max-w-4xl p-12 rounded-[50px] text-center border-4 shadow-2xl overflow-hidden
                ${lastPrize.isWinner 
                  ? 'bg-[#11261a] border-[#f2d47a]/50 shadow-[0_0_100px_rgba(242,212,122,0.2)]' 
                  : 'bg-[#1a0b0b] border-white/10'
                }
              `}
            >
              {/* Animated Confection for Winners */}
              {lastPrize.isWinner && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                  <motion.div 
                    animate={{ y: [-20, 20], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute top-10 left-1/4"><PartyPopper className="text-[#f2d47a]" size={40}/></motion.div>
                  <motion.div 
                    animate={{ y: [0, -30], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
                    className="absolute bottom-20 right-1/4"><Star className="text-[#f2d47a] fill-current" size={30}/></motion.div>
                </div>
              )}

              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <span className="text-sm font-black tracking-[0.5em] text-[#bfd0c2] uppercase opacity-60">Sorteio Cheers O Bar</span>
              
              <motion.div 
                animate={lastPrize.isWinner ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, 0]
                } : {}}
                transition={{ duration: 0.6, repeat: lastPrize.isWinner ? Infinity : 0 }}
                className="mt-8 flex justify-center"
              >
                <div className={`p-10 rounded-full border-4 ${lastPrize.isWinner ? 'bg-white/5 border-[#f2d47a] text-[#f2d47a]' : 'bg-white/5 border-white/10 text-white/40'}`}>
                  <lastPrize.icon className="w-24 h-24" strokeWidth={1} />
                </div>
              </motion.div>

              <h2 className={`mt-10 text-8xl font-black italic tracking-tighter uppercase leading-none ${lastPrize.isWinner ? 'text-white' : 'text-white/40'}`}>
                {lastPrize.displayTitle}
              </h2>
              
              <p className={`mt-6 text-3xl font-black tracking-[0.2em] uppercase ${lastPrize.isWinner ? 'text-[#f2d47a]' : 'text-white/30'}`}>
                {lastPrize.subtitle}
              </p>

              <div className="mt-16 flex items-center justify-center gap-8">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="px-8 py-4 bg-white text-black rounded-2xl text-lg font-black tracking-widest uppercase"
                >
                  Pressiona OK para Novo Jogo
                </motion.div>
              </div>
              
              {lastPrize.isWinner && (
                <div className="mt-8 text-[#008130] font-black flex items-center justify-center gap-3 tracking-[0.3em]">
                  <Star size={20} fill="currentColor" />
                  HEINEKEN & SAGRES NIGHTS
                  <Star size={20} fill="currentColor" />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes subtle-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-0.5deg); }
          75% { transform: rotate(0.5deg); }
        }
        .box-container {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
