/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, ArrowUp, LayoutGrid, List, Flag, Globe, Truck, Target, Gamepad2, Apple, Smartphone, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GAMES_DATA } from './data/games';
import { Game } from './types';
import AdsterraAd from './components/AdsterraAd';

const CATEGORIES = [
  { name: 'All', icon: Gamepad2 },
  { name: 'Racing', icon: Flag },
  { name: 'Open World', icon: Globe },
  { name: 'Simulation', icon: Truck },
  { name: 'Action', icon: Target },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<'Android' | 'iPhone' | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');



  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setSelectedDevice(null);
    setShowDeviceModal(true);
  };

  const handleDeviceSelect = (device: 'Android' | 'iPhone') => {
    setSelectedDevice(device);
    setShowDeviceModal(false);
    setShowVerification(true);
  };

  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-white font-sans selection:bg-[#00FF00] selection:text-black relative overflow-x-hidden">
      {/* Premium Background Glow System */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#161a22_0%,#0b0d12_100%)]" />
        
        {/* Layered Animated Glows */}
        <motion.div 
          animate={{ 
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[100%] h-[60%] bg-cyan-500/5 blur-[120px] rounded-full opacity-60" 
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 20, 0],
            y: [0, 30, -40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, 20, -30, 0],
            y: [0, 40, -20, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" 
        />
      </div>
      
      {/* Main Content Container */}
      <main className="max-w-3xl mx-auto px-4 pt-12 pb-20 relative z-10">
        <div className="space-y-8">
          {/* Advanced Search & Filter Section */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-[#222222] rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-hidden focus:border-[#00FF00]/30 focus:ring-1 focus:ring-[#00FF00]/30 transition-all shadow-lg"
              />
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* View Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl border transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-[#111111] border-[#00FF00]/40 text-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.1)]' 
                      : 'bg-[#111111] border-[#222222] text-gray-500 hover:border-[#333333]'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-xl border transition-all ${
                    viewMode === 'list' 
                      ? 'bg-[#111111] border-[#00FF00]/40 text-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.1)]' 
                      : 'bg-[#111111] border-[#222222] text-gray-500 hover:border-[#333333]'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border whitespace-nowrap transition-all ${
                      activeCategory === cat.name
                        ? 'bg-[#111111] border-[#00FF00]/40 text-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.1)]'
                        : 'bg-[#111111] border-[#222222] text-gray-400 hover:border-[#333333] hover:text-white'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.02,
                    ease: "easeOut"
                  }}
                  onClick={() => handleGameClick(game)}
                  className={`group relative bg-[#111111] border border-[#222222] hover:bg-[#161616] hover:border-[#00FF00]/20 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] ${
                    viewMode === 'grid' ? 'p-4 flex flex-col gap-4' : 'p-4 flex items-center gap-4'
                  }`}
                >
                  {/* Inner Highlight Effect */}
                  <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />

                  {/* Thumbnail */}
                  <div className={`shrink-0 rounded-xl overflow-hidden bg-[#222222] border border-[#333333] ${
                    viewMode === 'grid' ? 'w-full aspect-video' : 'w-16 h-16'
                  }`}>
                    <img
                      src={game.image}
                      alt={game.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Text Block */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-white font-semibold text-base truncate leading-tight">
                        {game.title}
                      </h3>
                      {viewMode === 'list' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF00]/60 bg-[#00FF00]/5 px-2 py-0.5 rounded-md border border-[#00FF00]/10">
                          {game.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  {/* Right Icon (List mode only) */}
                  {viewMode === 'list' && (
                    <div className="shrink-0 text-gray-600 group-hover:text-[#00FF00] transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredGames.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-20 text-gray-500"
              >
                No games found in this category
              </motion.div>
            )}
          </div>


        </div>
      </main>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 p-4 bg-[#1a1a1a] border border-[#333333] rounded-full shadow-2xl text-[#00FF00] hover:bg-[#222222] transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {selectedGame && showDeviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedGame(null);
                setShowDeviceModal(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1a1a] rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white/5 max-h-[90vh] overflow-y-auto"
            >
              {/* Game Context Header */}
              <div className="flex items-center gap-4 mb-6 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <img 
                    src={selectedGame.image} 
                    alt={selectedGame.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Selected Game</p>
                  <h4 className="text-white font-semibold truncate text-sm">{selectedGame.title}</h4>
                </div>
              </div>

              <div className="text-center space-y-3 mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Choose your device
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Select your device to continue with your chosen game.
                </p>
              </div>

              {/* Game Description Section */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-4 text-left">
                <p className="text-[#00FF00] font-bold text-[10px] uppercase tracking-widest mb-1">Game Description</p>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {selectedGame.description}
                </p>
              </div>

              {/* Adsterra Native Banner Ad - Placed exactly after game description and before buttons */}
              <div className="w-full mb-6">
                <AdsterraAd />
              </div>

              {/* Device Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#222222' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDeviceSelect('iPhone')}
                  className="w-full flex items-center justify-between bg-[#111111] border border-white/10 text-white font-semibold py-4 px-6 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Apple className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                    <span>iPhone</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#222222' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDeviceSelect('Android')}
                  className="w-full flex items-center justify-between bg-[#111111] border border-white/10 text-white font-semibold py-4 px-6 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Smartphone className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                    <span>Android</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {showVerification && selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVerification(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a1a] rounded-[2rem] p-8 shadow-2xl border border-[#00FF00]/20 overflow-hidden"
            >
              {/* Premium Glow Effect */}
              <div className="absolute -inset-px rounded-[2rem] border border-[#00FF00]/30 shadow-[0_0_30px_rgba(0,255,0,0.1)] pointer-events-none" />
              
              {/* Top Visual Area: Stylized Mobile Screen */}
              <div className="flex justify-center mb-8">
                <div className="w-32 h-64 bg-[#111111] rounded-[2.5rem] border-4 border-[#222222] p-3 relative shadow-inner overflow-hidden">
                  {/* Speaker/Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#222222] rounded-b-xl z-10" />
                  
                  {/* Screen Content */}
                  <div className="h-full w-full flex flex-col items-center pt-8 gap-4">
                    {/* Selected Game Icon */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                      <img 
                        src={selectedGame.image} 
                        alt={selectedGame.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    {/* Device Badge */}
                    <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 flex items-center gap-1.5">
                      {selectedDevice === 'iPhone' ? <Apple className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                      <span className="text-[10px] font-bold text-white">{selectedDevice}</span>
                    </div>
                    
                    {/* Blurred Placeholders */}
                    <div className="grid grid-cols-3 gap-2 w-full px-1">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="aspect-square bg-[#222222] rounded-lg blur-[2px] opacity-40" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="text-center space-y-3 mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Verification required
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed px-4">
                  Complete the next step to continue to your selected game.
                </p>
              </div>

              {/* Primary Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (typeof (window as any)._Tu === 'function') {
                      (window as any)._Tu();
                    }
                  }}
                  className="w-full bg-[#ccffdd] hover:bg-[#b3ffcc] text-black font-bold py-4 rounded-2xl transition-colors shadow-[0_4px_15px_rgba(0,255,0,0.2)] flex items-center justify-center gap-2 group"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  Continue
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
