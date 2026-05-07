import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Trophy, Wine, Beer, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';

// Game States
enum GameState {
  PICKING = 'PICKING',
  OPENING = 'OPENING',
  REVEALED = 'REVEALED'
}

interface Prize {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  isWinner: boolean;
}

const INITIAL_PRIZES: Prize[] = [
  { id: 'sm', title: '3 Shots + 3 Finos', subtitle: 'Prémio Simples', icon: Wine, color: '#f2d47a', isWinner: true },
  { id: 'lg', title: '6 Shots + 6 Finos', subtitle: 'GRANDE PRÉMIO', icon: Trophy, color: '#ff2b00', isWinner: true },
  { id: 'retry1', title: 'Sem Prémio', subtitle: 'Tenta outra vez', icon: RotateCcw, color: '#999', isWinner: false },
  { id: 'retry2', title: 'Sem Prémio', subtitle: 'Tenta outra vez', icon: RotateCcw, color: '#999', isWinner: false },
];

export default function App() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.PICKING);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [lastPrize, setLastPrize] = useState<Prize | null>(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);

  // Progressive Shuffle (Fisher-Yates) for better randomness on every play
  const shufflePrizes = useCallback(() => {
    const arr = [...INITIAL_PRIZES];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPrizes(arr);
  }, []);

  useEffect(() => {
    shufflePrizes();
  }, [shufflePrizes]);

  const handleOpen = useCallback(() => {
    if (gameState !== GameState.PICKING) return;
    
    setSelectedBoxIndex(focusedIndex);
    setGameState(GameState.OPENING);

    // Opening sequence
    setTimeout(() => {
      setGameState(GameState.REVEALED);
      setLastPrize(prizes[focusedIndex]);
    }, 1200); // Slightly faster for responsiveness
  }, [gameState, focusedIndex, prizes]);

  const resetGame = useCallback(() => {
    // Crucial: Shuffle immediately when resetting for the next round
    shufflePrizes();
    setGameState(GameState.PICKING);
    setSelectedBoxIndex(null);
  }, [shufflePrizes]);

  // Keyboard/Remote Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === GameState.REVEALED) {
        if (e.key === 'Enter' || e.key === 'OK' || e.key === 'Select') {
          resetGame();
        }
        return;
      }

      if (gameState !== GameState.PICKING) return;

      switch (e.key) {
        case 'ArrowLeft':
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : 3));
          break;
        case 'ArrowRight':
          setFocusedIndex(prev => (prev < 3 ? prev + 1 : 0));
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
  }, [gameState, handleOpen, resetGame, focusedIndex]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col font-sans bg-[#050d08]">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-[radial-gradient(circle,rgba(0,129,48,0.4)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-5%] left-0 w-[30%] h-[30%] bg-[radial-gradient(circle,rgba(255,43,0,0.15)_0%,transparent_70%)]" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 px-8 py-6 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-xs font-black tracking-widest text-[#bfd0c2] uppercase opacity-70">Cheers O Bar</span>
          <h1 className="text-4xl font-black text-white leading-tight">4 CAIXAS CHEERS</h1>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-xs font-black tracking-widest text-[#bfd0c2] uppercase opacity-70">Último Resultado</span>
          <span className="text-xl font-bold text-[#f2d47a]">{lastPrize ? lastPrize.title : 'Pronto para jogar'}</span>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-lg font-bold text-white/90">
            <Star className="w-5 h-5 fill-[#ff2b00] text-[#ff2b00]" />
            PATROCINADO POR HEINEKEN
            <Star className="w-5 h-5 fill-[#ff2b00] text-[#ff2b00]" />
          </div>
          <p className="mt-4 text-xl font-medium text-white/60 uppercase tracking-widest">
            {gameState === GameState.PICKING ? 'Escolhe a tua caixa e carrega OK' : 'A abrir...'}
          </p>
        </div>

        {/* Boxes Grid */}
        <div className="grid grid-cols-4 gap-8 w-full max-w-6xl">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="relative aspect-[4/5] flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: focusedIndex === idx ? 1.05 : 0.95,
                  y: focusedIndex === idx ? -10 : 0
                }}
                className={`w-full h-full rounded-2xl border-4 transition-colors duration-200 overflow-hidden relative shadow-2xl
                  ${focusedIndex === idx 
                    ? 'border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]' 
                    : 'border-white/10 dark-inner-shadow'
                  }
                  ${selectedBoxIndex === idx && gameState === GameState.OPENING ? 'animate-bounce' : ''}
                  ${idx === 0 || idx === 3 ? 'bg-gradient-to-br from-[#008130] to-[#014d1d]' : 'bg-gradient-to-br from-[#ff2b00] to-[#6b1200]'}
                `}
              >
                {/* Box Detail */}
                <div className="absolute inset-x-3 top-3 h-12 rounded-xl border border-white/20 bg-white/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-sm font-black opacity-60 uppercase mb-2">Caixa {idx + 1}</span>
                  <div className="text-3xl font-black italic tracking-tighter flex items-center">
                    CHEERS<span className="text-[#ff2b00] ml-1">★</span>
                  </div>
                </div>

                {/* Focus Indicator */}
                {focusedIndex === idx && gameState === GameState.PICKING && (
                  <motion.div 
                    layoutId="cursor"
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[20px] border-b-white drop-shadow-lg"
                  />
                )}
              </motion.div>
              
              {/* Box Shadow */}
              <div className="w-2/3 h-4 bg-black/40 blur-lg rounded-full mt-2" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 p-8 grid grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#008130]/20 flex items-center justify-center">
            {gameState === GameState.PICKING ? <ChevronRight className="text-[#008130]" /> : <Star className="text-[#f2d47a] animate-spin" />}
          </div>
          <div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Estado Atual</span>
            <p className="text-lg font-black text-white uppercase">{gameState === GameState.PICKING ? `Caixa ${focusedIndex + 1} pronta` : 'A Carregar...'}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#f2d47a]/20 flex items-center justify-center">
            <Trophy className="text-[#f2d47a]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Prémios Disponíveis</span>
            <p className="text-lg font-black text-white uppercase">Shots & Finos</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-black text-white">OK</div>
          <div>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-wider">Comando TV</span>
            <p className="text-lg font-black text-white uppercase">{gameState === GameState.REVEALED ? 'Carrega OK p/ Novo Jogo' : 'Usa as Setas + OK'}</p>
          </div>
        </div>
      </footer>

      {/* Result Overlay */}
      <AnimatePresence>
        {gameState === GameState.REVEALED && lastPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-10"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#11261a] border-4 border-white/20 w-full max-w-4xl p-16 rounded-[40px] text-center shadow-[0_0_100px_rgba(0,129,48,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-[#f2d47a] to-transparent" />
              
              <span className="text-xs font-black tracking-[0.3em] text-white/40 uppercase">Cheers O Bar Apresenta</span>
              
              <div className="mt-8 flex justify-center">
                <div className={`p-8 rounded-full ${lastPrize.isWinner ? 'bg-[#008130]/20 glow-gold' : 'bg-red-500/10'}`}>
                  <lastPrize.icon className={`w-24 h-24 ${lastPrize.isWinner ? 'text-[#f2d47a]' : 'text-red-500'}`} strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="mt-10 text-8xl font-black italic tracking-tighter text-white uppercase leading-none">
                {lastPrize.title}
              </h2>
              
              <p className="mt-6 text-2xl font-bold text-[#f2d47a] tracking-widest uppercase opacity-80">
                {lastPrize.subtitle}
              </p>

              <div className="mt-16 flex items-center justify-center gap-6">
                <div className="px-6 py-3 bg-white/5 rounded-full text-sm font-black text-white/60 tracking-widest border border-white/10 uppercase">
                  Pressiona OK para continuar
                </div>
                <div className="flex items-center gap-2 text-[#008130] font-black tracking-widest uppercase">
                  <Star className="w-5 h-5 fill-current" />
                  HEINEKEN NIGHTS
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .dark-inner-shadow {
          box-shadow: inset 0 0 20px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}
