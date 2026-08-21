import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Link as LinkIcon, 
  Check, 
  Image as ImageIcon,
  Sliders
} from '../common/Icons';
import { useApp } from '../../context/AppContext';
import { getDimmingLabel, getSpaceOverlayOpacity } from '../../utils/overlay';
import { MIN_BG_VISIBILITY } from '../../utils/constants';
import { isTrustedBackgroundImageUrl, normalizeHttpsUrl } from '../../utils/security';

export const SpacesView = () => {
  const { 
    spaces, 
    activeSpace, 
    setActiveSpaceId, 
    addSpace, 
    deleteSpace, 
    addSpaceLink, 
    deleteSpaceLink, 
    updateSpaceNotes,
    updateSpace,
    showToast,
  } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceBg, setNewSpaceBg] = useState('');
  const [newOverlayOpacity, setNewOverlayOpacity] = useState(0.75);
  const [newAssociatedSound, setNewAssociatedSound] = useState('forest');

  // Link Form State
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Curated High-Res Environments
  const PRESET_ENVIRONMENTS = [
    { label: 'Deep Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80', sound: 'forest' },
    { label: 'Emerald Canopy', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=2000&q=80', sound: 'rain' },
    { label: 'Misty Alpine', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80', sound: 'ocean' },
    { label: 'Serene River', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=80', sound: 'river' },
    { label: 'Sunlit Studio', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80', sound: 'cafe' },
    { label: 'Midnight Ocean', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80', sound: 'ocean' },
  ];

  const handleCreateSpace = (e) => {
    e.preventDefault();
    if (!newSpaceName.trim()) {
      alert('Please enter a name for your custom space.');
      return;
    }

    const bgUrl = newSpaceBg || PRESET_ENVIRONMENTS[0].url;

    addSpace({
      name: newSpaceName.trim(),
      type: 'image',
      bg: bgUrl,
      overlayOpacity: newOverlayOpacity,
      associatedSound: newAssociatedSound
    });

    setNewSpaceName('');
    setNewSpaceBg('');
    setShowCreateModal(false);
  };

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    const formattedUrl = normalizeHttpsUrl(linkUrl);
    if (!formattedUrl) {
      showToast('Enter a valid HTTPS link. Other protocols are blocked for safety.', 'error');
      return;
    }

    if (!addSpaceLink(activeSpace.id, { title: linkTitle, url: formattedUrl })) {
      showToast('Unable to add that link. Each space can contain up to 30 valid HTTPS links.', 'error');
      return;
    }
    setLinkTitle('');
    setLinkUrl('');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Work Spaces & Custom Environments
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Tailor atmospheric environments with background presets, overlay dimming, and soundscapes.
          </p>
        </div>

        <button
          onClick={() => {
            setNewSpaceName('');
            setNewSpaceBg(PRESET_ENVIRONMENTS[0].url);
            setNewOverlayOpacity(0.75);
            setNewAssociatedSound('forest');
            setShowCreateModal(true);
          }}
          className="btn-emerald px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Build Custom Environment
        </button>
      </div>

      {/* Grid of Spaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {spaces.map((space) => {
          const isActive = space.id === activeSpace.id;

          return (
            <div
              key={space.id}
              onClick={() => setActiveSpaceId(space.id)}
              className={`group relative h-48 rounded-2xl p-5 overflow-hidden cursor-pointer transition-all duration-300 border ${
                isActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02] shadow-xl'
                  : 'border-neutral-800 hover:border-neutral-600 hover:scale-[1.01]'
              }`}
              style={{
                background: space.type === 'image' && isTrustedBackgroundImageUrl(space.bg)
                  ? `linear-gradient(to bottom, rgba(9, 9, 11, 0.4), rgba(9, 9, 11, 0.9)), url(${space.bg}) center/cover no-repeat`
                  : space.bg
              }}
            >
              {/* Active Badge */}
              {isActive && (
                <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Check className="w-3 h-3" /> Active
                </span>
              )}

              {/* Space Info */}
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {space.name}
                  </h3>
                  <span className="text-xs text-neutral-300 font-medium">
                    {space.links?.length || 0} links • {space.associatedSound ? space.associatedSound.replace('-', ' ') : 'audio'}
                  </span>
                </div>

                {spaces.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSpace(space.id);
                    }}
                    className="p-2 rounded-lg bg-black/50 hover:bg-red-500/80 text-neutral-300 hover:text-white transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                    title="Delete space"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Space Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Space Notes */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <FileText className="w-5 h-5" />
              <span className="text-white">Notes for {activeSpace.name}</span>
            </div>
            <span className="text-xs text-neutral-400">Auto-saved to Local Storage</span>
          </div>

          <textarea
            value={activeSpace.notes || ''}
            onChange={(e) => updateSpaceNotes(activeSpace.id, e.target.value)}
            placeholder="Write your focus goals, outlines, or ideas for this space..."
            className="w-full h-64 glass-input rounded-xl p-4 text-sm resize-none leading-relaxed focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Right Column: Overlay Dimming Slider & Resource Links */}
        <div className="space-y-6">
          {/* Background Overlay Dimming Control */}
          <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Sliders className="w-4 h-4" />
                <span className="text-white">Background Overlay Dimming</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {getDimmingLabel(getSpaceOverlayOpacity(activeSpace))}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Background stays at least {Math.round(MIN_BG_VISIBILITY * 100)}% visible until dimming exceeds that threshold.
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={getSpaceOverlayOpacity(activeSpace)}
              onChange={(e) => updateSpace(activeSpace.id, { overlayOpacity: parseFloat(e.target.value) })}
              className="range-slider w-full"
              aria-label="Background overlay dimming"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(getSpaceOverlayOpacity(activeSpace) * 100)}
            />
          </div>

          {/* Links Block */}
          <div className="glass-panel rounded-2xl p-6 border border-neutral-800 space-y-5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold border-b border-neutral-800 pb-4">
              <LinkIcon className="w-5 h-5" />
              <span className="text-white">Resource Links</span>
            </div>

            {/* Link List */}
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {activeSpace.links?.length === 0 ? (
                <p className="text-xs text-neutral-400 italic py-2">
                  No bookmark links added yet.
                </p>
              ) : (
                activeSpace.links?.map((link) => (
                  <div 
                    key={link.id}
                    className="flex items-center justify-between p-3 rounded-xl glass-panel hover:border-neutral-700 transition-all text-xs"
                  >
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-400 hover:underline flex items-center gap-2 truncate max-w-[180px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{link.title}</span>
                    </a>
                    <button
                      onClick={() => deleteSpaceLink(activeSpace.id, link.id)}
                      className="text-neutral-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Link Form */}
            <form onSubmit={handleAddLink} className="space-y-3 pt-2 border-t border-neutral-800">
              <input
                type="text"
                placeholder="Link Title (e.g. Research Doc)"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
              />
              <input
                type="text"
                placeholder="URL (e.g. google.com)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
              />
              <button
                type="submit"
                className="w-full btn-emerald py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bookmark Link
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Build Custom Environment Modal (REQUIREMENT #4: Custom URL removed) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-neutral-700 space-y-6 animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" /> Build Custom Environment
              </h3>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-5">
              {/* Space Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Environment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Rain Studio"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {/* Preset Gallery */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-2">Curated Image Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_ENVIRONMENTS.map((preset) => {
                    const isSelected = newSpaceBg === preset.url;
                    return (
                      <div
                        key={preset.label}
                        onClick={() => {
                          setNewSpaceBg(preset.url);
                          setNewAssociatedSound(preset.sound);
                        }}
                        className={`h-16 rounded-xl overflow-hidden cursor-pointer relative border transition-all ${
                          isSelected ? 'ring-2 ring-emerald-500 border-emerald-400 scale-[1.02]' : 'border-neutral-800 opacity-70 hover:opacity-100'
                        }`}
                        style={{ background: `url(${preset.url}) center/cover` }}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white bg-black/70 px-1 py-0.5 rounded backdrop-blur-sm">
                          {preset.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ambient Audio & Opacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Associated Audio</label>
                  <select
                    value={newAssociatedSound}
                    onChange={(e) => setNewAssociatedSound(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="forest" className="bg-neutral-900 text-white">Forest Birds</option>
                    <option value="rain" className="bg-neutral-900 text-white">Gentle Rain</option>
                    <option value="ocean" className="bg-neutral-900 text-white">Soft Ocean</option>
                    <option value="river" className="bg-neutral-900 text-white">Quiet River</option>
                    <option value="cafe" className="bg-neutral-900 text-white">Gentle Café</option>
                    <option value="chimes" className="bg-neutral-900 text-white">Subtle Chimes</option>
                    <option value="binaural" className="bg-neutral-900 text-white">Binaural Beats</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Dimming: {getDimmingLabel(newOverlayOpacity)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={newOverlayOpacity}
                    onChange={(e) => setNewOverlayOpacity(parseFloat(e.target.value))}
                    className="range-slider w-full mt-2"
                    aria-label="New space overlay dimming"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-emerald px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg"
                >
                  Create Environment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
